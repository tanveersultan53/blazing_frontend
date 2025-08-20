import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Input } from '../../components/ui/input';
import { 
  MessageCircle, 
  Search, 
  MoreHorizontal, 
  Send, 
  Paperclip, 
  Smile,
  Check,
  Clock,
  Star
} from 'lucide-react';

const Inbox: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState(0);
  const [messageText, setMessageText] = useState('');

  const conversations = [
    {
      id: 0,
      name: 'Sarah Johnson',
      avatar: '/placeholder-avatar.jpg',
      lastMessage: 'Hey! How is the project going?',
      time: '2 min ago',
      unread: 2,
      online: true,
      messages: [
        { id: 1, sender: 'Sarah Johnson', text: 'Hey! How is the project going?', time: '2 min ago', isOwn: false },
        { id: 2, sender: 'You', text: 'Going great! Almost finished with the UI', time: '1 min ago', isOwn: true },
        { id: 3, sender: 'Sarah Johnson', text: 'That\'s awesome! Can\'t wait to see it', time: '2 min ago', isOwn: false },
      ]
    },
    {
      id: 1,
      name: 'Mike Chen',
      avatar: '/placeholder-avatar.jpg',
      lastMessage: 'Meeting at 3 PM today?',
      time: '1 hour ago',
      unread: 0,
      online: false,
      messages: [
        { id: 1, sender: 'Mike Chen', text: 'Meeting at 3 PM today?', time: '1 hour ago', isOwn: false },
      ]
    },
    {
      id: 2,
      name: 'Emma Wilson',
      avatar: '/placeholder-avatar.jpg',
      lastMessage: 'Thanks for the feedback!',
      time: '3 hours ago',
      unread: 1,
      online: true,
      messages: [
        { id: 1, sender: 'Emma Wilson', text: 'Thanks for the feedback!', time: '3 hours ago', isOwn: false },
      ]
    },
    {
      id: 3,
      name: 'Alex Rodriguez',
      avatar: '/placeholder-avatar.jpg',
      lastMessage: 'Let\'s catch up soon',
      time: '1 day ago',
      unread: 0,
      online: false,
      messages: [
        { id: 1, sender: 'Alex Rodriguez', text: 'Let\'s catch up soon', time: '1 day ago', isOwn: false },
      ]
    },
  ];

  const currentConversation = conversations[selectedConversation];

  const handleSendMessage = () => {
    if (messageText.trim()) {
      console.log('Sending message:', messageText);
      setMessageText('');
    }
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Messages
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search messages..."
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted transition-colors ${
                      selectedConversation === conversation.id ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversation.avatar} />
                        <AvatarFallback>{conversation.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      {conversation.online && (
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">{conversation.name}</p>
                        <p className="text-xs text-muted-foreground">{conversation.time}</p>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                    </div>
                    {conversation.unread > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {conversation.unread}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            {/* Chat Header */}
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={currentConversation.avatar} />
                      <AvatarFallback>{currentConversation.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    {currentConversation.online && (
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background"></div>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{currentConversation.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {currentConversation.online ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentConversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.isOwn
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <div className={`flex items-center gap-1 mt-1 ${
                      message.isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      <span className="text-xs">{message.time}</span>
                      {message.isOwn && <Check className="h-3 w-3" />}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button variant="ghost" size="icon">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Inbox;
