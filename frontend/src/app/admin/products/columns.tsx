'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { Product } from '@/types';
import Image from 'next/image';
import { CellAction } from './CellAction';

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'image',
    header: 'Ảnh',
    cell: ({ row }) => (
      <Image
        src={row.original.image}
        alt={row.original.productName}
        width={50}
        height={50}
        className="rounded-md object-cover"
      />
    ),
  },
  {
    accessorKey: 'productName',
    header: 'Tên sản phẩm',
  },
  {
    accessorKey: 'price',
    header: 'Giá',
    cell: ({ row }) => {
      const formattedPrice = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(Number(row.original.price));
      return <div>{formattedPrice}</div>;
    },
  },
  {
    accessorKey: 'stockQuantity',
    header: 'Tồn kho',
  },
  {
    accessorKey: 'status',
    header: 'Trạng thái',
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];