
"use client";

import type { Day } from '@/lib/types';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Briefcase, Newspaper, Ship } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

interface DayCardProps {
  day: Day;
}

function Section({ icon, title, children, className }: { icon: React.ReactNode, title: string, children: React.ReactNode, className?: string }) {
    return (
        <div className={cn("mb-6", className)}>
            <h3 className="font-headline text-lg flex items-center gap-2 mb-2 text-accent">
                {icon}
                {title}
            </h3>
            <div className="prose prose-invert max-w-none text-foreground/80">
                {children}
            </div>
        </div>
    )
}

export function DayCard({ day }: DayCardProps) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // This code runs only on the client
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
        setIsOnline(navigator.onLine);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
    }
    
    return () => {
        if (typeof window !== 'undefined') {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        }
    };
  }, []);

  const contentClassName = !isOnline ? 'offline-content' : '';

  // This function is necessary to safely render HTML with specific classes
  const renderHTML = (htmlString: string) => {
    return <div className={contentClassName} dangerouslySetInnerHTML={{ __html: htmlString }} />;
  }

  return (
    <AccordionItem value={`day-${day.day}`}>
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-base font-headline border-accent text-accent">Day {day.day}</Badge>
            <h2 className="text-xl font-headline text-left">{day.title}</h2>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-4 bg-background rounded-b-md">
        <Section icon={<Ship size={20} />} title="Program">
            {renderHTML(day.program)}
        </Section>
        
        <Section icon={<Newspaper size={20} />} title="Background">
            {renderHTML(day.background)}
        </Section>
        
        <Section icon={<Briefcase size={20} />} title="Packing Advice">
            <p>{day.packing_advice}</p>
        </Section>
      </AccordionContent>
    </AccordionItem>
  );
}

    