"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Save } from "lucide-react";
import { IHttpCodeDao } from "@/dao";
import { HttpCodeService } from "@/services/HttpCodeService";
import { SavedFilterService } from "@/services/SavedFilterService";
import debounce from "lodash/debounce";

const HttpCodeSearch = () => {
  const [filter, setFilter] = useState<string>("");
  const [filteredCodes, setFilteredCodes] = useState<IHttpCodeDao[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState<boolean>(false);
  const [listName, setListName] = useState<string>("");
  const { toast } = useToast();

  const fetchData = async (query: string) => {
    setLoading(true);
    try {
      const response = await HttpCodeService.getAll(query);
      setFilteredCodes(response);
    } catch (error) {
      setFilteredCodes([]);
    }
    setLoading(false);
  };

  const debouncedFetch = useCallback(debounce(fetchData, 500), []);

  useEffect(() => {
    fetchData("");
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    if (/^[0-9xX]*$/.test(input)) {
      setFilter(input);
      debouncedFetch(input);
    }
  };

  const handleSaveList = async (
    name: string,
    query: string,
    codes: IHttpCodeDao[]
  ) => {
    if (!name.trim()) {
      toast({
        title: "Filter name required",
        description: "Please provide a name for your list",
        variant: "destructive",
      });
      return;
    }

    const codeIds = codes.map((code) => code.id!);
    const response = await SavedFilterService.saveFilter(name, query, codeIds);

    if (response?.result) {
      toast({
        title: "Filter saved successfully",
        description: `Your filter \"${name}\" with ${codes.length} response codes has been saved.`,
      });
      clearPopUpData();
    } else {
      toast({
        title: "Filter Save Failed",
        description: response?.message ?? "Failed to save filter.",
        variant: "destructive",
      });
    }
  };

  const clearPopUpData = () => {
    setSaveDialogOpen(false);
    setListName("");
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-4 md:flex-row md:items-end md:justify-between md:space-y-0">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            HTTP Response Codes
          </h1>
          <p className="text-gray-500">
            Search and filter HTTP response codes with dog images
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <label htmlFor="filter" className="font-medium text-sm">
              Filter Codes
            </label>
            <input
              id="filter"
              type="text"
              placeholder="e.g., 200, 4xx, 30x"
              value={filter}
              onChange={handleFilterChange}
              className="p-2 border rounded-md"
            />
          </div>
          <button
            onClick={() => setSaveDialogOpen(true)}
            className="mt-6 p-2 bg-blue-500 w-full flex-row justify-center text-white rounded-md flex items-center"
          >
            <Save className="mr-2 h-4 w-4" />
            Save List
          </button>
        </div>
      </div>

      {saveDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="text-lg font-semibold mb-2">
              Save Response Code List
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Give your list a name to save it for future reference.
            </p>
            <div className="mb-4">
              <label htmlFor="list-name" className="block text-sm font-medium">
                List Name
              </label>
              <input
                id="list-name"
                placeholder="My Response Codes"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                maxLength={16}
                className="p-2 border rounded-md w-full"
              />
              {listName.length === 16 && (
                <p className="text-xs text-red-500">
                  Maximum character limit reached (16).
                </p>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-4">
              This list will contain {filteredCodes.length} response codes.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => clearPopUpData()}
                className="p-2 bg-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveList(listName, filter, filteredCodes)}
                className="p-2 bg-green-500 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={!listName.trim() || listName.length > 16}
              >
                Save List
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="mt-8 text-center text-gray-500">Loading...</div>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {!loading && filteredCodes.length > 0
          ? filteredCodes.map((code) => (
              <div
                key={code.code}
                className="overflow-hidden rounded-lg border bg-white shadow-sm"
              >
                <div className="flex flex-col space-y-1.5 p-6">
                  <span className="text-2xl font-semibold">{code.code}</span>
                  <span className="text-sm text-gray-500">{code.name}</span>
                </div>
                <img
                  src={code.image || "/placeholder.svg"}
                  alt={`HTTP ${code.code} - ${code.name}`}
                  className="aspect-video w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "/placeholder.svg?height=200&width=400";
                  }}
                />
              </div>
            ))
          : !loading && (
              <div className="col-span-full flex flex-col items-center justify-center py-12">
                <h3 className="text-xl font-semibold">
                  No matching response codes
                </h3>
                <p className="text-gray-500">
                  Try a different filter pattern like 2xx, 30x, or 404
                </p>
              </div>
            )}
      </div>
    </div>
  );
};

export default HttpCodeSearch;
