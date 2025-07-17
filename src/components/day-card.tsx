
"use client";

import type { Day } from '@/lib/types';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Briefcase, Newspaper, Ship, Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';

interface DayCardProps {
  day: Day;
  onNotesChange: (dayNumber: number, notes: string) => void;
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

export function DayCard({ day, onNotesChange }: DayCardProps) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

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

  const renderHTML = (htmlString: string) => {
    return <div className={contentClassName} dangerouslySetInnerHTML={{ __html: htmlString }} />;
  }

  return (
    <AccordionItem value={`day-${day.day}`}>
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-base font-headline border-accent text-accent">Dag {day.day}</Badge>
            <h2 className="text-xl font-headline text-left">{day.title}</h2>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-4 bg-background rounded-b-md">
        <Section icon={<Ship size={20} />} title="Programma">
            {renderHTML(day.program)}
        </Section>
        
        <Section icon={<Newspaper size={20} />} title="Achtergrond">
            {renderHTML(day.background)}
        </Section>
        
        <Section icon={<Briefcase size={20} />} title="Pakadvies">
            <p>{day.packing_advice}</p>
        </Section>

        <Section icon={<Pencil size={20} />} title="Notities">
            <Textarea
              placeholder="Voeg hier je persoonlijke notities toe..."
              value={day.notes || ''}
              onChange={(e) => onNotesChange(day.day, e.target.value)}
              className="mt-2 bg-input border-input"
            />
        </Section>
      </AccordionContent>
    </AccordionItem>
  );
}

    