use futures_util::future;
use warp::Filter;
mod chatbot;
mod websocket;

#[tokio::main]
async fn main() {
	let main = warp::fs::dir("pages");
	let debug = warp::path!("index" / String).map(|input| format!("Hello {}", input));

	let ws_text_filter = warp::path("ws").and(warp::ws()).map(|ws: warp::ws::Ws| {
		ws.on_upgrade(async |web_socket| websocket::handle_text(web_socket).await)
	});

	let ws_voice_filter = warp::path("ws").and(warp::ws().map(|ws: warp::ws::Ws| {
		ws.on_upgrade(async |web_socket| websocket::handle_voice(web_socket).await)
	}));

	let address = [0, 0, 0, 0];
	let main_serve = warp::serve(main)
		.tls()
		.cert_path("tls/cert.pem")
		.key_path("tls/key.pem")
		.run((address, 8080));
	let debug_serve = warp::serve(debug).run((address, 7878));
	let ws_text_serve = warp::serve(ws_text_filter)
		//.tls()
		//.cert_path("tls/cert.pem")
		//.key_path("tls/key.pem")
		.run((address, 3030));
	let ws_voice_serve = warp::serve(ws_voice_filter).run((address, 3031));

	future::join4(main_serve, debug_serve, ws_text_serve, ws_voice_serve).await;
}
