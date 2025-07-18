
"use client";

import type { Itinerary } from '@/lib/types';
import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Upload, Save, ChevronsUpDown, Ship, WifiOff } from 'lucide-react';
import { Accordion } from './ui/accordion';
import { DayCard } from './day-card';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export default function ItineraryDisplay() {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [openDays, setOpenDays] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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

  useEffect(() => {
    try {
      const savedItinerary = localStorage.getItem('galapagos-itinerary');
      if (savedItinerary) {
        setItinerary(JSON.parse(savedItinerary));
      } else if (navigator.onLine) {
        fetch('/reisdata.json')
          .then(res => {
            if (!res.ok) {
              throw new Error("Kon standaard reisplan niet ophalen");
            }
            return res.json();
          })
          .then(data => {
            setItinerary(data);
            localStorage.setItem('galapagos-itinerary', JSON.stringify(data));
          })
          .catch(error => {
            console.error(error);
            toast({
              variant: "destructive",
              title: "Fout",
              description: "Kon standaard reisplan niet laden.",
            });
          });
      }
    } catch (error) {
      console.error("Kon reisplan niet laden:", error);
      localStorage.removeItem('galapagos-itinerary');
      toast({
        variant: "destructive",
        title: "Fout",
        description: "Kon opgeslagen reisplan niet laden. De gegevens zijn mogelijk beschadigd.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleNotesChange = (dayIndex: number, notes: string) => {
    if (!itinerary) return;
    const newItinerary = itinerary.map((day, index) => 
      index === dayIndex ? { ...day, notes } : day
    );
    setItinerary(newItinerary);
    localStorage.setItem('galapagos-itinerary', JSON.stringify(newItinerary));
  };
  
  const handleLoadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result;
          if (typeof text === 'string') {
            const json = JSON.parse(text);
            setItinerary(json);
            localStorage.setItem('galapagos-itinerary', text);
            toast({
              title: "Succes",
              description: "Reisplan succesvol geladen.",
            });
          }
        } catch (error) {
          console.error("Fout bij parsen JSON-bestand:", error);
          toast({
            variant: "destructive",
            title: "Bestandsfout",
            description: "Kon het JSON-bestand niet parsen. Controleer het formaat.",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSaveJson = async () => {
    if (!itinerary) return;

    const dataStr = JSON.stringify(itinerary, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });

    // Use the File System Access API if available
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: 'reisdata_met_notities.json',
          types: [{
            description: 'JSON Files',
            accept: { 'application/json': ['.json'] },
          }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        toast({
            title: "Succes",
            description: "Reisplan succesvol opgeslagen.",
        });
      } catch (err) {
        // This can happen if the user cancels the save dialog
        if (err instanceof DOMException && err.name === 'AbortError') {
          console.log('Save dialog was cancelled by the user.');
        } else {
          console.error("Fout bij opslaan bestand:", err);
          toast({
              variant: "destructive",
              title: "Opslaan Mislukt",
              description: "Het reisplan kon niet worden opgeslagen.",
          });
        }
      }
    } else {
      // Fallback for older browsers
      const url = URL.createObjectURL(blob);
      const linkElement = document.createElement('a');
      linkElement.href = url;
      linkElement.download = 'reisdata_met_notities.json';
      document.body.appendChild(linkElement);
      linkElement.click();
      document.body.removeChild(linkElement);
      URL.revokeObjectURL(url);
      toast({
          title: "Succes",
          description: "Reisplan is gedownload.",
      });
    }
  };

  const toggleAllDays = () => {
    if (!itinerary) return;
    if (openDays.length === itinerary.length) {
      setOpenDays([]);
    } else {
      setOpenDays(itinerary.map((day, index) => `day-${index + 1}`));
    }
  };


  const renderContent = () => {
    if (isLoading) {
      return (
          <CardContent className="mt-6">
              <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
              </div>
          </CardContent>
      );
    }

    if (!itinerary) {
      return (
        <CardContent className="mt-6 text-center">
            <Ship className="mx-auto h-12 w-12 text-primary" />
            <h3 className="mt-4 text-lg font-medium">Geen Reisplan Geladen</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Laad uw 'reisdata.json' bestand om uw reisdetails te zien.
            </p>
            <Button onClick={handleLoadClick} className="mt-6">
                <Upload className="mr-2 h-4 w-4" /> Laad van Apparaat
            </Button>
        </CardContent>
      )
    }

    return (
        <CardContent>
            <Accordion type="multiple" value={openDays} onValueChange={setOpenDays} className="w-full">
                {itinerary.map((day, index) => (
                    <DayCard key={index} day={day} dayIndex={index} onNotesChange={handleNotesChange} />
                ))}
            </Accordion>
        </CardContent>
    );
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <TooltipProvider>
        <Card className="border-primary/20 bg-card/50">
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <CardTitle className="font-headline text-2xl text-accent">Galapagos Reisplan</CardTitle>
                        <CardDescription className="mt-2">Een 15-daagse reis door de Betoverende Eilanden.</CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex gap-2 flex-wrap justify-end">
                          <Tooltip>
                            <TooltipTrigger asChild>
                               <Button onClick={handleLoadClick} variant="outline" size="icon" aria-label="Reisplan laden">
                                    <Upload />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Laden</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button onClick={handleSaveJson} variant="outline" size="icon" disabled={!itinerary} aria-label="Reisplan opslaan">
                                  <Save />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Opslaan</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button onClick={toggleAllDays} variant="outline" size="icon" disabled={!itinerary} aria-label="Alles openen of sluiten">
                                  <ChevronsUpDown />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Open/Dicht</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        {!isOnline && (
                             <div className="flex items-center text-xs text-destructive gap-2 p-2 rounded-md bg-destructive/10">
                                <WifiOff size={14} />
                                <span>Offline Modus</span>
                            </div>
                        )}
                    </div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
            </CardHeader>
            {renderContent()}
        </Card>
        </TooltipProvider>
    </div>
  );
}
