// Type declarations for versioned package imports (Figma Make syntax)
declare module '*@*' {
  const content: any;
  export = content;
}

declare module 'sonner@2.0.3' {
  export * from 'sonner';
}

declare module 'tailwind-merge' {
  export function twMerge(...args: any[]): string;
}

declare module 'capacitor-plugin-safe-area' {
  export const SafeArea: any;
}
