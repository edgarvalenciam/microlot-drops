"use client";

import { useState, useEffect, useRef } from "react";
import type { Origin, Process, Roaster, DropStatus } from "@/types";
import { ORIGINS, PROCESSES, ROASTERS } from "@/data/catalogs";

interface FilterBarProps {
  selectedOrigin: Origin | null;
  selectedProcess: Process | null;
  selectedRoaster: Roaster | null;
  selectedStatus: DropStatus | null;
  onOriginChange: (origin: Origin | null) => void;
  onProcessChange: (process: Process | null) => void;
  onRoasterChange: (roaster: Roaster | null) => void;
  onStatusChange: (status: DropStatus | null) => void;
}

export function FilterBar({
  selectedOrigin,
  selectedProcess,
  selectedRoaster,
  selectedStatus,
  onOriginChange,
  onProcessChange,
  onRoasterChange,
  onStatusChange,
}: FilterBarProps) {
  const [showOrigin, setShowOrigin] = useState(false);
  const [showProcess, setShowProcess] = useState(false);
  const [showRoaster, setShowRoaster] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  const originRef = useRef<HTMLDivElement>(null);
  const processRef = useRef<HTMLDivElement>(null);
  const roasterRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  const statusOptions: DropStatus[] = ["ACTIVE", "COMPLETED", "EXPIRED"];
  const statusLabels: Record<DropStatus, string> = {
    ACTIVE: "Activo",
    COMPLETED: "Completado",
    EXPIRED: "Caducado",
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (originRef.current && !originRef.current.contains(event.target as Node)) {
        setShowOrigin(false);
      }
      if (processRef.current && !processRef.current.contains(event.target as Node)) {
        setShowProcess(false);
      }
      if (roasterRef.current && !roasterRef.current.contains(event.target as Node)) {
        setShowRoaster(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setShowStatus(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const clearAll = () => {
    onOriginChange(null);
    onProcessChange(null);
    onRoasterChange(null);
    onStatusChange(null);
  };

  const hasActiveFilters =
    selectedOrigin || selectedProcess || selectedRoaster || selectedStatus;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6 border border-gray-200 dark:border-gray-700">
      <div className="flex flex-wrap gap-4 items-center">
        {/* Origin Filter */}
        <div className="relative" ref={originRef}>
          <button
            onClick={() => setShowOrigin(!showOrigin)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedOrigin
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Origen {selectedOrigin && `: ${selectedOrigin}`}
          </button>
          {showOrigin && (
            <div className="absolute z-10 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto">
              <button
                onClick={() => {
                  onOriginChange(null);
                  setShowOrigin(false);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                Todos los Orígenes
              </button>
              {ORIGINS.map((origin) => (
                <button
                  key={origin}
                  onClick={() => {
                    onOriginChange(origin);
                    setShowOrigin(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    selectedOrigin === origin
                      ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {origin}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Process Filter */}
        <div className="relative" ref={processRef}>
          <button
            onClick={() => setShowProcess(!showProcess)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedProcess
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Proceso {selectedProcess && `: ${selectedProcess}`}
          </button>
          {showProcess && (
            <div className="absolute z-10 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto">
              <button
                onClick={() => {
                  onProcessChange(null);
                  setShowProcess(false);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                Todos los Procesos
              </button>
              {PROCESSES.map((process) => (
                <button
                  key={process}
                  onClick={() => {
                    onProcessChange(process);
                    setShowProcess(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    selectedProcess === process
                      ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {process}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Roaster Filter */}
        <div className="relative" ref={roasterRef}>
          <button
            onClick={() => setShowRoaster(!showRoaster)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedRoaster
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Tostador {selectedRoaster && `: ${selectedRoaster}`}
          </button>
          {showRoaster && (
            <div className="absolute z-10 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto">
              <button
                onClick={() => {
                  onRoasterChange(null);
                  setShowRoaster(false);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                Todos los Tostadores
              </button>
              {ROASTERS.map((roaster) => (
                <button
                  key={roaster}
                  onClick={() => {
                    onRoasterChange(roaster);
                    setShowRoaster(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    selectedRoaster === roaster
                      ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {roaster}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status Filter */}
        <div className="relative" ref={statusRef}>
          <button
            onClick={() => setShowStatus(!showStatus)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedStatus
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Estado {selectedStatus && `: ${statusLabels[selectedStatus]}`}
          </button>
          {showStatus && (
            <div className="absolute z-10 mt-2 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  onStatusChange(null);
                  setShowStatus(false);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                Todos los Estados
              </button>
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    onStatusChange(status);
                    setShowStatus(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    selectedStatus === status
                      ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {statusLabels[status]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="px-4 py-2 rounded-md text-sm font-medium bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
          >
            Limpiar Todo
          </button>
        )}
      </div>
    </div>
  );
}

