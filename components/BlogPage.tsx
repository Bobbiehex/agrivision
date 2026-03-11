
import React from 'react';
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  image: string;
  category: string;
}

const MOCK_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'The Future of Precision Agriculture in the Middle East',
    excerpt: 'How drone technology is transforming arid landscapes into productive agricultural hubs through intelligent water management.',
    date: 'March 10, 2026',
    author: 'Admin',
    image: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=800&q=80',
    category: 'Technology'
  },
  {
    id: '2',
    title: 'Livestock Health: Early Detection via Thermal Imaging',
    excerpt: 'Using thermal sensors on drones to identify early signs of heat stress and illness in large herds before symptoms become visible.',
    date: 'March 5, 2026',
    author: 'AgriExpert',
    image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=800&q=80',
    category: 'Livestock'
  },
  {
    id: '3',
    title: 'Sustainable Farming: Reducing Chemical Use with Spot Spraying',
    excerpt: 'How precise mapping allows for targeted application of fertilizers and pesticides, reducing environmental impact and costs.',
    date: 'February 28, 2026',
    author: 'EcoFarmer',
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80',
    category: 'Sustainability'
  }
];

export const BlogPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <BookOpen className="text-emerald-600" />
            {t('nav_blog')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Latest insights from the intersection of agriculture and technology.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {MOCK_POSTS.map((post) => (
          <article 
            key={post.id} 
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow group"
          >
            <div className="aspect-video overflow-hidden">
              <img 
                src={post.image} 
                alt={post.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                <span>{post.category}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight group-hover:text-emerald-600 transition-colors">
                {post.title}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                {post.excerpt}
              </p>
              <div className="pt-4 border-t border-slate-50 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {post.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    {post.author}
                  </div>
                </div>
                <button className="text-emerald-600 dark:text-emerald-400 hover:translate-x-1 transition-transform">
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
