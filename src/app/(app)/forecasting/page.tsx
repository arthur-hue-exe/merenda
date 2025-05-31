
"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Loader2, Send, User, Bot } from "lucide-react";
import { getChatResponse } from "./actions"; 
import type { ChatMessage } from "@/types";
import { toast } from "@/hooks/use-toast";

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if(scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (currentMessage.trim() === "" || isLoading) return;

    const newUserMessage: ChatMessage = { role: "user", text: currentMessage };
    setMessages(prev => [...prev, newUserMessage]);
    setCurrentMessage("");
    setIsLoading(true);

    const chatHistoryForApi = messages.slice(-5); // Send last 5 messages as history

    const result = await getChatResponse(newUserMessage.text, chatHistoryForApi);

    if ("error" in result) {
      toast({ title: "Erro no Chat", description: result.error, variant: "destructive" });
      const errorMessage: ChatMessage = {role: 'model', text: `Erro: ${result.error}`};
      setMessages(prev => [...prev, errorMessage]);
    } else {
      const modelResponse: ChatMessage = { role: "model", text: result.modelResponse };
      setMessages(prev => [...prev, modelResponse]);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]"> {/* Adjust height as needed */}
      <Card className="flex-1 flex flex-col shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <MessageSquare className="h-7 w-7 text-primary" />
            Chat com MerendaBot
          </CardTitle>
          <CardDescription>
            Converse com a IA para tirar dúvidas e obter informações sobre a gestão da merenda.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea ref={scrollAreaRef} className="h-full p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-end gap-2 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "model" && (
                  <AvatarIcon role="model" />
                )}
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 text-sm shadow ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {/* Basic markdown-like newlines */}
                  {msg.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                </div>
                {msg.role === "user" && (
                  <AvatarIcon role="user" />
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 justify-start">
                <AvatarIcon role="model" />
                <div className="max-w-[70%] rounded-lg px-4 py-2 text-sm shadow bg-muted text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </ScrollArea>
        </CardContent>
        <CardFooter className="border-t p-4">
          <div className="flex w-full items-center gap-2">
            <Input
              type="text"
              placeholder="Digite sua mensagem..."
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={isLoading || currentMessage.trim() === ""}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="sr-only">Enviar</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

const AvatarIcon = ({ role }: { role: 'user' | 'model'}) => {
    const Icon = role === 'user' ? User : Bot;
    return (
        <div className={`flex h-8 w-8 items-center justify-center rounded-full shrink-0 ${role === 'user' ? 'bg-accent text-accent-foreground' : 'bg-primary/80 text-primary-foreground'}`}>
            <Icon className="h-5 w-5" />
        </div>
    )
}
