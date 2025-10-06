// Styling from https://flowbite.com/docs/forms/search-input/
import { useRef } from "react";

export default function SearchBar(
  {placeholder, defaultValue, onClickSearch}: {placeholder: string, defaultValue?: string, onClickSearch?: (searchTerm: string) => void}
) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && onClickSearch) {
      onClickSearch(inputRef?.current?.value || '')
    }
  }

  return (
    <div className="flex items-center mx-auto">
    <div className="relative w-full">
        <input defaultValue={defaultValue} type="search" id="default-search" className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500" placeholder={placeholder} onKeyDown={handleKeyDown} ref={inputRef} required />
    </div>
    <button onClick={onClickSearch ? (e) => onClickSearch(inputRef?.current?.value || '') : (e) => {}} type="submit" className="p-4 ms-2 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
        <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
        </svg>
        <span className="sr-only">Search</span>
    </button>
    </div>
  )
}
