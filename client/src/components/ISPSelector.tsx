import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X, CheckSquare, Square } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ISP {
  name: string;
  asn?: string;
  country: string;
  state?: string;
  city?: string;
}

interface ISPSelectorProps {
  isps: ISP[];
  selectedISPs: ISP[];
  onSelectionChange: (selected: ISP[]) => void;
  isLoading?: boolean;
}

export function ISPSelector({ isps, selectedISPs, onSelectionChange, isLoading }: ISPSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState<string>("Brazil");
  const [stateFilter, setStateFilter] = useState<string>("all");

  const countries = useMemo(() => {
    const uniqueCountries = Array.from(new Set(isps.map(isp => isp.country)));
    return uniqueCountries.sort();
  }, [isps]);

  const states = useMemo(() => {
    if (countryFilter === "all") return [];
    const uniqueStates = Array.from(
      new Set(
        isps
          .filter(isp => isp.country === countryFilter && isp.state)
          .map(isp => isp.state!)
      )
    );
    return uniqueStates.sort();
  }, [isps, countryFilter]);

  const filteredISPs = useMemo(() => {
    return isps.filter(isp => {
      const matchesSearch = searchQuery === "" || 
        isp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        isp.asn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        isp.city?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCountry = countryFilter === "all" || isp.country === countryFilter;
      const matchesState = stateFilter === "all" || isp.state === stateFilter;

      return matchesSearch && matchesCountry && matchesState;
    });
  }, [isps, searchQuery, countryFilter, stateFilter]);

  const isSelected = (isp: ISP) => {
    return selectedISPs.some(
      selected => 
        selected.name === isp.name && 
        selected.country === isp.country &&
        selected.state === isp.state &&
        selected.city === isp.city
    );
  };

  const toggleISP = (isp: ISP) => {
    if (isSelected(isp)) {
      onSelectionChange(
        selectedISPs.filter(
          selected => !(
            selected.name === isp.name && 
            selected.country === isp.country &&
            selected.state === isp.state &&
            selected.city === isp.city
          )
        )
      );
    } else {
      onSelectionChange([...selectedISPs, isp]);
    }
  };

  const selectAll = () => {
    const newSelection = [...selectedISPs];
    filteredISPs.forEach(isp => {
      if (!isSelected(isp)) {
        newSelection.push(isp);
      }
    });
    onSelectionChange(newSelection);
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  const allFilteredSelected = filteredISPs.length > 0 && filteredISPs.every(isp => isSelected(isp));

  return (
    <Card>
      <CardHeader>
        <CardTitle>ISP Selection</CardTitle>
        <CardDescription>
          Select ISPs to test. Use filters to narrow down your selection.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ISP name, ASN, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-isp"
            />
          </div>
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchQuery("")}
              data-testid="button-clear-search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Select value={countryFilter} onValueChange={(value) => {
            setCountryFilter(value);
            setStateFilter("all");
          }}>
            <SelectTrigger data-testid="select-country-filter">
              <SelectValue placeholder="Filter by country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map(country => (
                <SelectItem key={country} value={country}>{country}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            value={stateFilter} 
            onValueChange={setStateFilter}
            disabled={countryFilter === "all" || states.length === 0}
          >
            <SelectTrigger data-testid="select-state-filter">
              <SelectValue placeholder="Filter by state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {states.map(state => (
                <SelectItem key={state} value={state}>{state}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={allFilteredSelected ? clearAll : selectAll}
              disabled={filteredISPs.length === 0}
              data-testid="button-select-all"
            >
              {allFilteredSelected ? (
                <>
                  <Square className="h-4 w-4 mr-1" />
                  Clear Visible
                </>
              ) : (
                <>
                  <CheckSquare className="h-4 w-4 mr-1" />
                  Select All Visible
                </>
              )}
            </Button>
            {selectedISPs.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                data-testid="button-clear-all"
              >
                Clear All
              </Button>
            )}
          </div>
          <Badge variant="secondary" data-testid="badge-selection-count">
            {selectedISPs.length} selected
          </Badge>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="text-sm text-muted-foreground">Loading ISPs...</div>
            </div>
          ) : filteredISPs.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <div className="text-sm text-muted-foreground">
                {isps.length === 0 ? "No ISPs available" : "No ISPs match your filters"}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredISPs.map((isp, index) => (
                <div
                  key={`${isp.name}-${isp.country}-${isp.state}-${isp.city}-${index}`}
                  className="flex items-start gap-3 p-3 rounded-md border hover-elevate active-elevate-2 cursor-pointer"
                  onClick={() => toggleISP(isp)}
                  data-testid={`item-isp-${index}`}
                >
                  <Checkbox
                    checked={isSelected(isp)}
                    onCheckedChange={() => toggleISP(isp)}
                    className="mt-0.5"
                    data-testid={`checkbox-isp-${index}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{isp.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {isp.city && `${isp.city}, `}
                      {isp.state && `${isp.state}, `}
                      {isp.country}
                      {isp.asn && ` • ASN: ${isp.asn}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
