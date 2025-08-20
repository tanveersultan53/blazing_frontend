import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Search, TrendingUp, Users, Hash, MapPin } from 'lucide-react';

const Explore: React.FC = () => {
  const trendingTopics = [
    { name: '#TechNews', posts: '1.2K', trending: true },
    { name: '#ReactJS', posts: '856', trending: true },
    { name: '#WebDev', posts: '642', trending: false },
    { name: '#AI', posts: '1.5K', trending: true },
    { name: '#Startup', posts: '432', trending: false },
  ];

  const suggestedUsers = [
    { name: 'Sarah Johnson', handle: '@sarahj', avatar: '/placeholder-avatar.jpg', followers: '12.5K' },
    { name: 'Mike Chen', handle: '@mikechen', avatar: '/placeholder-avatar.jpg', followers: '8.2K' },
    { name: 'Emma Wilson', handle: '@emmaw', avatar: '/placeholder-avatar.jpg', followers: '15.7K' },
    { name: 'Alex Rodriguez', handle: '@alexr', avatar: '/placeholder-avatar.jpg', followers: '6.9K' },
  ];

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Explore
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search for topics, people, or places..."
                  className="w-full pl-10 pr-4 py-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </CardContent>
          </Card>

          {/* Trending Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Trending Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trendingTopics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{topic.name}</p>
                        <p className="text-sm text-muted-foreground">{topic.posts} posts</p>
                      </div>
                    </div>
                    {topic.trending && (
                      <Badge variant="secondary" className="text-xs">
                        Trending
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Popular Places */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Popular Places
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['San Francisco, CA', 'New York, NY', 'London, UK', 'Tokyo, Japan'].map((place, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{place}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Suggested Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Suggested Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suggestedUsers.map((user, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.handle}</p>
                        <p className="text-xs text-muted-foreground">{user.followers} followers</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Follow
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Explore Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {['Technology', 'Business', 'Entertainment', 'Sports', 'Science', 'Health'].map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded hover:bg-muted transition-colors cursor-pointer">
                    <span className="text-sm">{category}</span>
                    <Badge variant="secondary" className="text-xs">
                      {Math.floor(Math.random() * 1000) + 100}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Explore;
