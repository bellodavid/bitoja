import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatProps {
  tradeId: string;
}

interface Message {
  id: string;
  tradeId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  };
}

// Mock messages for demo
const mockMessages: Message[] = [
  {
    id: "1",
    tradeId: "1",
    senderId: "user1",
    content: "Hi! I'm interested in your offer. Is it still available?",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    sender: {
      id: "user1",
      firstName: "John",
      lastName: "Doe",
      profileImageUrl: "https://via.placeholder.com/150",
    },
  },
  {
    id: "2",
    tradeId: "1",
    senderId: "demo-user-123",
    content: "Yes, it's still available! How much would you like to trade?",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    sender: {
      id: "demo-user-123",
      firstName: "Demo",
      lastName: "User",
      profileImageUrl: "https://via.placeholder.com/150",
    },
  },
];

export default function Chat({ tradeId }: ChatProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim() || !user) return;

    const message: Message = {
      id: Date.now().toString(),
      tradeId,
      senderId: user.id,
      content: newMessage.trim(),
      createdAt: new Date().toISOString(),
      sender: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
      },
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isOwnMessage = (message: Message) => {
    return message.senderId === user?.id;
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                isOwnMessage(message) ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isOwnMessage(message)
                    ? "bg-bitoja-green text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-medium">
                    {message.sender.firstName} {message.sender.lastName}
                  </span>
                  <span className="text-xs opacity-70">
                    {formatMessageTime(message.createdAt)}
                  </span>
                </div>
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="bg-bitoja-green hover:bg-bitoja-green-dark text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
