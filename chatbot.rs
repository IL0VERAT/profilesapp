use openai_api_rs::v1::{
	api::OpenAIClient,
	chat_completion::{self, ChatCompletionRequest},
	common::GPT4_O,
};

#[inline]
pub async fn get_response(request: &str) -> String {
	let api_key = std::env::var("OPENAI_API_KEY").unwrap();
	let req = ChatCompletionRequest::new(
		GPT4_O.to_string(),
		vec![chat_completion::ChatCompletionMessage {
			role: chat_completion::MessageRole::user,
			content: chat_completion::Content::Text(String::from(request)),
			name: None,
			tool_calls: None,
			tool_call_id: None,
		}],
	);
	let mut client = OpenAIClient::builder()
		.with_api_key(api_key)
		.build()
		.unwrap();
	let result = client.chat_completion(req).await.unwrap();
	result.choices[0].message.content.clone().unwrap()
}

pub async fn voice_response() -> String {
	String::new()
}
