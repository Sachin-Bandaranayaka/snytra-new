"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Users, Clock, ChefHat, CheckCircle, Plus, Edit, Trash, Info } from 'lucide-react';

// Table status types
type TableStatus = 'available' | 'occupied' | 'reserved' | 'dirty' | 'maintenance';

// Table interface
interface Table {
    id: number;
    tableNumber: string;
    capacity: number;
    status: TableStatus;
    location?: string;
    currentOrder?: {
        id: number;
        status: string;
        startTime: string;
    };
    reservation?: {
        id: number;
        customerName: string;
        time: string;
        partySize: number;
    };
}

interface TableMapProps {
    tables: Table[];
    editable?: boolean;
    onTableClick?: (tableId: number) => void;
    onStatusChange?: (tableId: number, status: TableStatus) => void;
    onDeleteTable?: (tableId: number) => void;
    onEditTable?: (tableId: number) => void;
    onAddTable?: () => void;
}

export default function TableMap({
    tables,
    editable = false,
    onTableClick,
    onStatusChange,
    onDeleteTable,
    onEditTable,
    onAddTable,
}: TableMapProps) {
    const router = useRouter();
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);
    const [showMenu, setShowMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            if (showMenu) setShowMenu(false);
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showMenu]);

    // Handle table click
    const handleTableClick = (table: Table, e: React.MouseEvent) => {
        e.stopPropagation();

        if (editable) {
            setSelectedTable(table);
            setMenuPosition({ x: e.clientX, y: e.clientY });
            setShowMenu(true);
        } else if (onTableClick) {
            onTableClick(table.id);
        }
    };

    // Handle status change
    const handleStatusChange = (status: TableStatus) => {
        if (selectedTable && onStatusChange) {
            onStatusChange(selectedTable.id, status);
            setShowMenu(false);
        }
    };

    // Get table color based on status
    const getTableColor = (status: TableStatus) => {
        switch (status) {
            case 'available':
                return 'bg-green-100 border-green-500 text-green-800';
            case 'occupied':
                return 'bg-red-100 border-red-500 text-red-800';
            case 'reserved':
                return 'bg-blue-100 border-blue-500 text-blue-800';
            case 'dirty':
                return 'bg-yellow-100 border-yellow-500 text-yellow-800';
            case 'maintenance':
                return 'bg-gray-100 border-gray-500 text-gray-800';
            default:
                return 'bg-gray-100 border-gray-300 text-gray-800';
        }
    };

    // Get table icon based on status
    const getTableIcon = (status: TableStatus) => {
        switch (status) {
            case 'available':
                return <CheckCircle className="h-4 w-4" />;
            case 'occupied':
                return <ChefHat className="h-4 w-4" />;
            case 'reserved':
                return <Clock className="h-4 w-4" />;
            case 'dirty':
                return <AlertCircle className="h-4 w-4" />;
            case 'maintenance':
                return <Info className="h-4 w-4" />;
            default:
                return null;
        }
    };

    return (
        <div className="relative">
            <div className="grid grid-cols-4 gap-4 md:grid-cols-6 lg:grid-cols-8">
                {tables.map((table) => (
                    <div
                        key={`table-${table.id}`}
                        onClick={(e) => handleTableClick(table, e)}
                        className={`${getTableColor(table.status)} relative cursor-pointer p-4 rounded-lg border-2 shadow-sm flex flex-col items-center justify-center h-32 transition-all transform hover:scale-105 hover:shadow-md`}
                    >
                        <div className="absolute top-2 right-2 flex items-center">
                            {getTableIcon(table.status)}
                        </div>
                        <span className="text-lg font-bold">{table.tableNumber}</span>
                        <div className="flex items-center mt-1">
                            <Users className="h-4 w-4 mr-1" />
                            <span className="text-sm">{table.capacity}</span>
                        </div>
                        <div className="mt-2 text-xs text-center">
                            {table.status === 'occupied' && table.currentOrder && (
                                <span>
                                    Order #{table.currentOrder.id}
                                    <br />
                                    {table.currentOrder.status}
                                </span>
                            )}
                            {table.status === 'reserved' && table.reservation && (
                                <span>
                                    {table.reservation.customerName}
                                    <br />
                                    {table.reservation.time}
                                </span>
                            )}
                        </div>
                    </div>
                ))}

                {editable && onAddTable && (
                    <div
                        onClick={onAddTable}
                        className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                        <Plus className="h-6 w-6 text-gray-400" />
                        <span className="text-sm text-gray-500 mt-2">Add Table</span>
                    </div>
                )}
            </div>

            {/* Context menu for table actions */}
            {showMenu && selectedTable && (
                <div
                    className="absolute bg-white shadow-lg rounded-lg z-10 w-48"
                    style={{
                        top: `${menuPosition.y}px`,
                        left: `${menuPosition.x}px`,
                        transform: 'translate(-50%, 10px)'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-2 border-b border-gray-100">
                        <h3 className="font-medium">Table {selectedTable.tableNumber}</h3>
                        <p className="text-xs text-gray-500">Status: {selectedTable.status}</p>
                    </div>
                    {editable && (
                        <div className="p-1">
                            <button
                                onClick={() => onEditTable && onEditTable(selectedTable.id)}
                                className="flex w-full items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Table
                            </button>
                            <button
                                onClick={() => onDeleteTable && onDeleteTable(selectedTable.id)}
                                className="flex w-full items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                            >
                                <Trash className="h-4 w-4 mr-2" />
                                Delete Table
                            </button>
                            <div className="border-t border-gray-100 my-1"></div>
                        </div>
                    )}
                    {onStatusChange && (
                        <div className="p-1">
                            <div className="px-3 py-1 text-xs font-medium text-gray-500">Change Status:</div>
                            <button
                                onClick={() => handleStatusChange('available')}
                                className="flex w-full items-center px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-md"
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Available
                            </button>
                            <button
                                onClick={() => handleStatusChange('occupied')}
                                className="flex w-full items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                            >
                                <ChefHat className="h-4 w-4 mr-2" />
                                Occupied
                            </button>
                            <button
                                onClick={() => handleStatusChange('reserved')}
                                className="flex w-full items-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
                            >
                                <Clock className="h-4 w-4 mr-2" />
                                Reserved
                            </button>
                            <button
                                onClick={() => handleStatusChange('dirty')}
                                className="flex w-full items-center px-3 py-2 text-sm text-yellow-600 hover:bg-yellow-50 rounded-md"
                            >
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Needs Cleaning
                            </button>
                            <button
                                onClick={() => handleStatusChange('maintenance')}
                                className="flex w-full items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
                            >
                                <Info className="h-4 w-4 mr-2" />
                                Maintenance
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
} 