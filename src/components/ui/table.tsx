import * as React from 'react'

function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <div className="relative w-full overflow-x-auto">
      <table className={className} {...props} />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return <thead className={className} {...props} />
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return <tbody className={className} {...props} />
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return <tfoot className={className} {...props} />
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      className={
        className
          ? `border-b border-black/10 transition-colors hover:bg-black/5 ${className}`
          : 'border-b border-black/10 transition-colors hover:bg-black/5'
      }
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      className={
        className
          ? `h-10 px-3 text-left align-middle font-medium text-sm ${className}`
          : 'h-10 px-3 text-left align-middle font-medium text-sm'
      }
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      className={
        className
          ? `p-3 align-middle text-sm ${className}`
          : 'p-3 align-middle text-sm'
      }
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<'caption'>) {
  return (
    <caption
      className={className ? `mt-4 text-sm text-black/70 ${className}` : 'mt-4 text-sm text-black/70'}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}