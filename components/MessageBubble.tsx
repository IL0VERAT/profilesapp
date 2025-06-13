interface MessageBubbleProps {
  message: string;
  isUser: boolean;
  timestamp: string; // Changed from Date to string to handle ISO strings
}

export function MessageBubble({
  message,
  isUser,
  timestamp,
}: MessageBubbleProps) {
  const formatTimestamp = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.warn("Invalid timestamp:", isoString);
      return "";
    }
  };

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      <div
        className={`max-w-[70%] rounded-lg px-4 py-3 ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        }`}
      >
        <div className="whitespace-pre-wrap">{message}</div>
        <div
          className={`text-xs mt-2 opacity-70 ${
            isUser ? "text-right" : "text-left"
          }`}
        >
          {formatTimestamp(timestamp)}
        </div>
      </div>
    </div>
  );
}