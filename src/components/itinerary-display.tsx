
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
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from './ui/tooltip';


export default function ItineraryDisplay() {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [openDays, setOpenDays] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const introduction = itinerary?.find(day => day.day === -1 || day.day === "-1");
  const regularDays = itinerary?.filter(day => day.day !== -1 && day.day !== "-1");

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
  
    // Find the correct index in the original itinerary array
    const actualIndex = itinerary.findIndex(d => 
        (dayIndex === -1 ? (d.day === -1 || d.day === "-1") : d.day === regularDays?.[dayIndex]?.day)
    );
  
    if (actualIndex > -1) {
      const newItinerary = [...itinerary];
      const dayData = newItinerary[actualIndex];
      const updatedDayData = { ...dayData, notes };
      newItinerary[actualIndex] = updatedDayData;
      setItinerary(newItinerary);
      localStorage.setItem('galapagos-itinerary', JSON.stringify(newItinerary));
    }
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
  
  const fallbackSave = (blob: Blob) => {
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

  const handleSaveJson = async () => {
    if (!itinerary) return;

    const dataStr = JSON.stringify(itinerary, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });

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
            description: "Reisplan opgeslagen.",
        });
      } catch (err: any) {
        if (err.name === 'AbortError') {
          // User cancelled the save operation, do nothing.
        } else if (err.name === 'SecurityError') {
            console.warn("Save picker failed due to security restrictions (e.g., in an iframe), using fallback.", err);
            fallbackSave(blob);
        } else {
          console.error("Fout bij opslaan met picker, fallback wordt gebruikt:", err);
          fallbackSave(blob);
        }
      }
    } else {
        fallbackSave(blob);
    }
  };

  const toggleAllDays = () => {
    if (!itinerary) return;
    const allDayKeys = itinerary.map((day, index) => `day-${index + 1}`);
    // Special handling for introduction day if its key is different.
    const introIndex = itinerary.findIndex(d => d.day === -1 || d.day === "-1");
    if (introIndex !== -1) {
        allDayKeys[introIndex] = `day-${introIndex + 1}`;
    }

    if (openDays.length === itinerary.length) {
      setOpenDays([]);
    } else {
      setOpenDays(allDayKeys);
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
    
    const introductionIndex = itinerary.findIndex(d => d.day === -1 || d.day === "-1");
    
    return (
        <CardContent>
            <Accordion type="multiple" value={openDays} onValueChange={setOpenDays} className="w-full">
                {introduction && <DayCard key={-1} day={introduction} dayIndex={introductionIndex} onNotesChange={(dayIndex, notes) => handleNotesChange(introductionIndex, notes)} />}
                {regularDays && regularDays.map((day, index) => {
                     const dayIndexInItinerary = itinerary.findIndex(d => d.day === day.day);
                     return <DayCard key={dayIndexInItinerary} day={day} dayIndex={dayIndexInItinerary} onNotesChange={(dayIdx, notes) => handleNotesChange(dayIndexInItinerary, notes)} />
                })}
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
                        <CardTitle className="font-headline text-xl text-accent">{introduction?.title || "Galapagos Reisplan"}</CardTitle>
                        <CardDescription className="mt-2 text-base">{introduction?.subtitle || "Een 15-daagse reis door de Betoverende Eilanden."}</CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex gap-2 flex-wrap justify-end">
                          <Tooltip>
                            <TooltipTrigger asChild>
                               <Button onClick={handleLoadClick} variant="outline" size="sm" aria-label="Reisplan laden">
                                    <Upload />
                                    <span className="hidden sm:inline ml-2">Laden</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Reisplan laden</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button onClick={handleSaveJson} variant="outline" size="sm" disabled={!itinerary} aria-label="Reisplan opslaan">
                                  <Save />
                                   <span className="hidden sm:inline ml-2">Opslaan</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Reisplan opslaan</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button onClick={toggleAllDays} variant="outline" size="sm" disabled={!itinerary} aria-label="Alles openen of sluiten">
                                  <ChevronsUpDown />
                                   <span className="hidden sm:inline ml-2">Open/Dicht</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Alles openen of sluiten</p>
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
                <label htmlFor="itinerary-file-upload" className="sr-only">Reisplan JSON uploaden</label>
                <input
                  id="itinerary-file-upload"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".json"
                  aria-label="Reisplan JSON uploaden"
                />
            </CardHeader>
            {renderContent()}
        </Card>
        </TooltipProvider>
    </div>
  );
}

    
