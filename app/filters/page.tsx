"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Edit, Trash, Calendar, ListIcon, XCircle } from "lucide-react";
import { TSavedFilter } from "@/dao";
import { SavedFilterService } from "@/services/SavedFilterService";
import { useToast } from "@/components/ui/use-toast";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@radix-ui/react-accordion";

const FiltersPage = () => {
  const [lists, setLists] = useState<TSavedFilter[]>([]);
  const [selectedList, setSelectedList] = useState<TSavedFilter | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editCodes, setEditCodes] = useState<TSavedFilter["httpCodes"]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "detail">("grid");
  const router = useRouter();
  const { toast } = useToast();
  const [openAccordion, setOpenAccordion] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    const response = await SavedFilterService.getAll();
    if (response) {
      setLists(response);
    }
  };

  const handleDeleteList = async (id: string) => {
    const response = await SavedFilterService.deleteById(id);
    if (response.result) {
      setLists(lists.filter((list) => list.id !== id));
      if (selectedList?.id === id) {
        setSelectedList(null);
      }
      toast({
        title: "Delete Saved Filter",
        description: "Filter deleted successfully",
      });
    } else {
      toast({
        title: "Delete Saved Filter",
        description: response.message ?? "Failed to delete filter",
        variant: "destructive",
      });
    }
  };

  const handleEditList = async () => {
    if (!selectedList) return;
    const response = await SavedFilterService.updateById(selectedList.id, {
      ...selectedList,
      name: editName,
      httpCodes: editCodes,
    });
    if (response?.result) {
      setLists((prev) => {
        prev.splice(
          prev.findIndex(({ id }) => id === selectedList.id),
          1,
          response.filter!
        );
        return [...prev];
      });
      toast({
        title: "Update Saved Filter",
        description: "Filter updated successfully",
      });
      resetSelection();
    } else {
      toast({
        title: "Update Saved Filter",
        description: response?.errorMessage ?? "Failed to update filter",
        variant: "destructive",
      });
    }
  };

  const handleRemoveCode = (codeId: string) => {
    setEditCodes((prevCodes) => prevCodes?.filter((c) => c.id !== codeId));
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const resetSelection = () => {
    setSelectedList(null);
    setEditName("");
    setEditCodes([]);
    setEditDialogOpen(false);
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold">My Response Code Lists</h1>
      <p className="text-muted-foreground">
        Manage your saved HTTP response code lists
      </p>

      <div className="flex items-center justify-between mt-6">
        <div>
          <button
            className={`px-4 py-2 border rounded-md mr-2 ${
              viewMode === "grid" ? "bg-gray-300" : ""
            }`}
            onClick={() => setViewMode("grid")}
          >
            Grid View
          </button>
          <button
            className={`px-4 py-2 border rounded-md ${
              viewMode === "detail" ? "bg-gray-300" : ""
            }`}
            onClick={() => setViewMode("detail")}
          >
            Detail View
          </button>
        </div>
      </div>

      {lists.length > 0 ? (
        <div
          className={`grid ${
            viewMode === "grid" ? "gap-6 sm:grid-cols-2 lg:grid-cols-3" : ""
          } mt-8`}
        >
          {lists.map((list) => (
            <div
              key={list.id}
              className="border p-4 rounded-md shadow-md cursor-pointer"
              onClick={() =>
                setOpenAccordion(
                  openAccordion === list.id ? undefined : list.id
                )
              }
            >
              <h2 className="font-semibold">{list.name}</h2>
              <p className="text-sm text-muted-foreground flex items-center">
                <Calendar className="mr-1 h-3 w-3" />{" "}
                {formatDate(list.createdAt)}
              </p>

              {viewMode === "grid" ? (
                <div className="flex flex-wrap gap-1 mt-2">
                  {list.httpCodes?.slice(0, 5).map((code) => (
                    <span
                      key={code.code}
                      className="bg-muted px-2 py-1 text-xs rounded-md"
                    >
                      {code.code}
                    </span>
                  ))}
                  {list.httpCodes && list.httpCodes.length > 5 && (
                    <span className="bg-gray-300 px-2 py-1 text-xs rounded-md">
                      +{list.httpCodes.length - 5} more
                    </span>
                  )}
                </div>
              ) : (
                <Accordion
                  type="single"
                  collapsible
                  value={openAccordion}
                  onValueChange={setOpenAccordion}
                >
                  <AccordionItem value={list.id}>
                    <AccordionTrigger>
                      {!openAccordion ? <p>Click here to view</p> : ""}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {(list.httpCodes ?? []).map((code) => (
                          <div
                            key={code.code}
                            className="border rounded-md p-2"
                          >
                            <img
                              src={code.image}
                              alt={`HTTP ${code.code}`}
                              className="w-full h-auto rounded-md"
                            />
                            <p className="text-center text-xs mt-2">
                              {code.code}
                            </p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}

              <div className="mt-4 flex justify-between">
                <button
                  className="border px-3 py-1 rounded-md"
                  onClick={() => {
                    setSelectedList(list);
                    setEditName(list.name);
                    setEditCodes(list.httpCodes);
                    setEditDialogOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4 inline" /> Edit
                </button>
                <button
                  className="border px-3 py-1 rounded-md text-red-500"
                  onClick={() => handleDeleteList(list.id)}
                >
                  <Trash className="h-4 w-4 inline" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center justify-center border p-12 rounded-lg">
          <ListIcon className="h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No lists found</h3>
          <button
            className="mt-4 border px-4 py-2 rounded-md"
            onClick={() => router.push("/search")}
          >
            Go to Search
          </button>
        </div>
      )}

      {editDialogOpen && selectedList && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Edit List</h2>
            <input
              type="text"
              className="border p-2 rounded w-full mb-4"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              {editCodes?.map((code) => (
                <div key={code.code} className="relative border p-2 rounded-md">
                  <img
                    src={code.image}
                    alt={`HTTP ${code.code}`}
                    className="w-full h-auto rounded-md"
                  />
                  <p className="text-center text-xs mt-2">{code.code}</p>
                  <button
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                    onClick={() => handleRemoveCode(code.id)}
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button
                className="border px-4 py-2 rounded-md mr-2"
                onClick={() => resetSelection()}
              >
                Cancel
              </button>
              <button
                className="border px-4 py-2 rounded-md bg-blue-500 text-white"
                onClick={handleEditList}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default FiltersPage;
