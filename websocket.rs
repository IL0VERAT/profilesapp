use std::error::Error;

use futures_util::{SinkExt, StreamExt, TryFutureExt};
use warp::{filters::ws::WebSocket, ws::Message};

use crate::chatbot;

pub async fn text_response(prompt: Message) -> Message {
	let mut response: String = String::from("null");
	if prompt.is_text() {
		response = chatbot::get_response(prompt.to_str().unwrap()).await;
		//response = String::from("New Response");
	}
	Message::text(response)
}

pub async fn get_ephemeral_key(key: String) -> Message {
	let client: reqwest::Client = reqwest::Client::new();
	let json = [
		("model", "gpt-4o-realtime-preview-2024-12-17"),
		("voice", "verse"),
	];
	dbg!("Getting key");

	let response = client
		.post("https://api.openapi.com/v1/realtime/sessions")
		.header("Authorization", format!("Bearer {key}"))
		.header("Content-Type", "application/json")
		.json(&json)
		.send()
		.await;
	dbg!("TEST");
	if let Ok(data) = response {
		return Message::text(data.text().await.unwrap());
	} else {
		return Message::text("Error");
	}
}

pub async fn handle_voice(ws: WebSocket) {
	let (mut tx, _): (
		futures_util::stream::SplitSink<WebSocket, Message>,
		futures_util::stream::SplitStream<WebSocket>,
	) = ws.split();
	dbg!("Handling voice");
	_ = tx.send(get_ephemeral_key(std::env::var("OPENAI_API_KEY").unwrap()).await);
	_ = tx.flush();
}

pub async fn handle_text(ws: WebSocket) {
	let (mut tx, mut rx) = ws.split();

	loop {
		let received = rx.next().await;
		if received.is_none() {
			break;
		}
		if let Ok(prompt) = received.unwrap() {
			tx.send(text_response(prompt).await)
				.unwrap_or_else(|e| eprintln!("Websocket Error {}", e))
				.await;
		} else {
			break;
		}
	}
}
