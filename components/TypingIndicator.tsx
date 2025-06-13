export function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-muted text-muted-foreground rounded-lg px-4 py-3 max-w-[70%]">
        <div className="flex items-center gap-1">
          <span>Delegate is thinking</span>
          <div className="flex gap-1 ml-2">
            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}