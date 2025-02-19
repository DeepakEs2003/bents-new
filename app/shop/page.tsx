'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from '@/components/ui/select';
import { Loader2, ExternalLink, Search } from 'lucide-react';
import Header from '@/components/Header';
import { useSession } from '@/lib/hooks/useSession';
import { useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';

// Types
interface Product {
  id: string;
  title: string;
  link: string;
  image_data?: string;
  groupTags: string[];
}

interface GroupedProducts {
  [key: string]: Product[];
}

interface ProductCardProps {
  product: Product;
  index: number;
}

const GradientBackground = () => (
  <div className="fixed inset-0 w-full h-full z-[-1]">
    <div className="relative w-full h-full bg-[#e6f3ff] dark:bg-black transition-colors duration-700 ease-in-out">
      <div className="absolute inset-0" 
        style={{
          backgroundImage: `
            linear-gradient(135deg, var(--pattern-color) 25%, transparent 25%) -40px 0,
            linear-gradient(225deg, var(--pattern-color) 25%, transparent 25%) -40px 0,
            linear-gradient(315deg, var(--pattern-color) 25%, transparent 25%),
            linear-gradient(45deg, var(--pattern-color) 25%, transparent 25%)
          `,
          backgroundSize: '80px 80px',
          backgroundColor: 'rgba(59, 130, 246, 0.05)',
          opacity: '0.4',
          '--pattern-color': 'rgba(59, 130, 246, 0.1)',
          transition: 'all 700ms cubic-bezier(0.4, 0, 0.2, 1)'
        } as React.CSSProperties}
      />
      <div className="absolute inset-0"
        style={{
          background: `
            linear-gradient(90deg, 
              var(--grid-color) 1px, 
              transparent 1px
            ),
            linear-gradient(180deg, 
              var(--grid-color) 1px, 
              transparent 1px
            )
          `,
          backgroundSize: '20px 20px',
          mask: 'radial-gradient(circle at 50% 50%, black, transparent)',
          '--grid-color': 'rgba(59, 130, 246, 0.07)',
          transition: 'all 700ms cubic-bezier(0.4, 0, 0.2, 1)'
        } as React.CSSProperties}
      />
    </div>
  </div>
);

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { 
    opacity: 0,
    scale: 0.8,
    y: 20
  },
  show: { 
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      duration: 0.5,
      bounce: 0.3
    }
  }
};

// ProductCard Component
function ProductCard({ product, index }: ProductCardProps) {
  const imageUrl = product.image_data
    ? `data:image/jpeg;base64,${product.image_data}`
    : '/default-image.jpg';

  return (
    <motion.div
      variants={cardVariants}
      className="w-full"
    >
      <Card className="w-full flex flex-col h-full bg-white dark:bg-gray-700 rounded-xl border-0
        shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]
        hover:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)]
        hover:transform hover:-translate-y-1
        transition-all duration-300 ease-in-out">
        <CardContent className="p-0 flex-grow flex flex-col">
          <div className="relative group">
            <div className="w-full h-56 overflow-hidden rounded-t-xl">
              <div className="relative w-full h-full bg-gray-50">
                <Image
                  src={imageUrl}
                  alt={product.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-contain transition-all duration-500 group-hover:scale-110"
                  priority={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          </div>
          <div className="p-5 ">
            <h3 className="font-semibold text-lg leading-tight dark:text-white text-gray-800 line-clamp-2 min-h-[3rem]">
              {product.title}
            </h3>
          </div>
        </CardContent>
        <CardFooter className="px-5 pb-5 pt-0">
          <a
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center px-4 py-2.5
              bg-black text-white rounded-lg font-medium
              hover:bg-black/80 transform transition-all duration-300
              shadow-[0_4px_12px_rgba(59,130,246,0.25)]
              hover:shadow-[0_6px_16px_rgba(59,130,246,0.35)]"
          >
            View Product <ExternalLink size={16} className="ml-2" />
          </a>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

// Main Page Component
export default function ShopPage() {
  const { userId = null } = useAuth();
  const {
    sessions,
    currentSessionId,
    setCurrentSessionId,
    setSessions
  } = useSession();

  const handleNewConversation = () => {
    const newSession = { id: crypto.randomUUID(), conversations: [] };
    setSessions(prev => [...prev, newSession]);
    setCurrentSessionId(newSession.id);
  };

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [groupedProducts, setGroupedProducts] = useState<GroupedProducts>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('default');

  useEffect(() => {
   // In shop/page.tsx, update the fetchProducts function:

   const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get<{
        products: Product[];
        groupedProducts: GroupedProducts;
        sortOption: string;
      }>(`/api/products?sort=${sortOption}`);
  
      if (response.data.sortOption === 'video') {
        setGroupedProducts(response.data.groupedProducts);
        setProducts([]);
      } else {
        setProducts(response.data.products);
        setGroupedProducts({});
      }
    } catch (error: any) {
      console.error('Error fetching products:', error);
      setError(
        error.response?.data?.message || 
        'Failed to fetch products. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };
    fetchProducts();
  }, [sortOption]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSort = (value: string) => {
    setLoading(true);
    setSortOption(value);
  };

  const filterProducts = (productsToFilter: Product[]) => {
    return productsToFilter.filter(product =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.groupTags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  if (error) {
    return (
      <div className="text-center mt-8 text-red-500" role="alert">
        <p>{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <>
    <GradientBackground />
    <div className=" relative ">
      
      <Header 
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSessionSelect={handleSessionSelect}
        onNewConversation={handleNewConversation}
        userId={userId}
      />
      <div className="container mx-auto px-2 py-4 max-w-7xl  mt-16 md:mt-24 relative z-10">
        <header className="mb-8 pt-8 md:pt-0">
          <h1 
            className="text-xl md:text-2xl lg:text-3xl font-bold text-center mb-6 relative text-gray-900 dark:text-gray-100"
            style={{
              WebkitTextStroke: '1px rgba(0, 0, 0, 0.1)',
              animation: 'textFloat 3s ease-in-out infinite'
            }}
          >
            <style jsx>{`
              @keyframes textFloat {
                0%, 100% {
                  transform: translateY(0px);
                  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
                }
                50% {
                  transform: translateY(-8px);
                  filter: drop-shadow(0 8px 8px rgba(0, 0, 0, 0.15));
                }
              }
            `}</style>
            Recommended Products
          </h1>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative w-full sm:w-64">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <div className="w-48 sm:w-[200px] self-start sm:self-auto">
              <Select value={sortOption} onValueChange={handleSort}>
                <SelectTrigger className="w-full bg-white text-gray-500 rounded-[8px] border-gray-300">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-50 rounded-[8px]">
                  <SelectItem value="default" className="text-gray-500 bg-white hover:bg-gray-100 cursor-pointer">
                    Sort by
                  </SelectItem>
                  <SelectItem value="video" className="text-gray-500 bg-white hover:bg-gray-100 cursor-pointer">
                    Sort by Video Title
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        <main>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="relative w-32 rounded-full h-32">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  webkit-playsinline="true"
                  className="w-full h-full object-cover rounded-full"
                  onCanPlay={(e) => {
                    const video = e.target as HTMLVideoElement;
                    video.play().catch(error => console.log("Autoplay failed:", error));
                  }}
                >
                  <source src="/Carpenter Cutting Wood.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          ) : sortOption === 'video' ? (
            Object.entries(groupedProducts).map(([tag, products]) => (
              <div key={tag} className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">{tag}</h2>
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  {filterProducts(products).map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </motion.div>
              </div>
            ))
          ) : (
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {filterProducts(products).map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </motion.div>
          )}
          {!loading && filterProducts(products).length === 0 && Object.keys(groupedProducts).length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 mt-8">
              No products found matching your search.
            </p>
          )}
        </main>
      </div>
    </div>
    </>
  );
}
