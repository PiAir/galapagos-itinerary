
"use client";

import type { Day } from '@/lib/types';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Briefcase, Newspaper, Ship, Pencil, Film, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';

interface DayCardProps {
  day: Day;
  dayIndex: number;
  onNotesChange: (dayIndex: number, notes: string) => void;
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

export function DayCard({ day, dayIndex, onNotesChange }: DayCardProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editableNotes, setEditableNotes] = useState(day.notes || '');

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

  const handleEdit = () => {
    setEditableNotes(day.notes || '');
    setIsEditing(true);
  };

  const handleSave = () => {
    onNotesChange(dayIndex, editableNotes);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };
  
  const contentClassName = !isOnline ? 'offline-content' : '';

  const MarkdownRenderer = ({ content }: { content: string }) => (
    <div className={contentClassName}>
      <ReactMarkdown
        components={{
          a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );

  const getDayLabel = () => {
    if (day.day === -1 || day.day === "-1") {
      return "Inleiding";
    }
    return day.day;
  }

  return (
    <AccordionItem value={`day-${dayIndex + 1}`}>
      <AccordionTrigger className="hover:no-underline text-lg">
         <div className="flex items-center gap-4">
         <Badge variant="outline" className="text-base font-headline border-accent text-accent">{getDayLabel()}</Badge>
         <h2 className="text-lg font-headline text-left">{day.title}</h2>
         </div>
      </AccordionTrigger>
      <AccordionContent className="p-4 bg-background rounded-b-md">
        {day.program && (
          <Section icon={<Ship size={20} />} title="Programma">
              <MarkdownRenderer content={day.program} />
          </Section>
        )}
        
        {day.background && (
          <Section icon={<Newspaper size={20} />} title="Achtergrond">
              <MarkdownRenderer content={day.background} />
          </Section>
        )}
        
        {day.packing_advice && (
          <Section icon={<Briefcase size={20} />} title="Pakadvies">
               <MarkdownRenderer content={day.packing_advice} />
          </Section>
        )}

        {day.videos && (
          <Section icon={<Film size={20} />} title="Videos">
              <MarkdownRenderer content={day.videos} />
          </Section>
        )}

        {day.notes !== undefined && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-headline text-lg flex items-center gap-2 text-accent">
                    <Pencil size={20} />
                    Notities
                </h3>
                {!isEditing && (
                    <Button variant="ghost" size="icon" onClick={handleEdit} className="h-8 w-8">
                        <Pencil size={16} />
                    </Button>
                )}
            </div>
            <div className="prose prose-invert max-w-none text-foreground/80">
                {isEditing ? (
                    <div className="space-y-2">
                        <Textarea
                            placeholder="Voeg hier je persoonlijke notities toe..."
                            value={editableNotes}
                            onChange={(e) => setEditableNotes(e.target.value)}
                            className="mt-2 bg-input border-input"
                            rows={5}
                        />
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={handleCancel}>
                                <X className="mr-2 h-4 w-4"/> Annuleren
                            </Button>
                            <Button onClick={handleSave}>
                                <Save className="mr-2 h-4 w-4"/> Opslaan
                            </Button>
                        </div>
                    </div>
                ) : (
                    day.notes ? <MarkdownRenderer content={day.notes} /> : <p className="text-muted-foreground italic">Geen notities. Klik op het potlood om te bewerken.</p>
                )}
            </div>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
