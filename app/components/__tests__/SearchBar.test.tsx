import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchBar from '../ui/SearchBar';

jest.mock('../../hooks/useSearch', () => ({
  __esModule: true,
  default: () => ({
    handleSearch: jest.fn(),
    searchTerm: '',
    setSearchTerm: jest.fn(),
    isLoading: false,
  }),
}));

describe('SearchBar Component', () => {
  it('renders correctly with default props', () => {
    render(<SearchBar placeholder="Search customers..." />);
    
    const searchInput = screen.getByPlaceholderText('Search customers...');
    expect(searchInput).toBeInTheDocument();
  });

  it('allows user to input search term', () => {
    const handleSearchMock = jest.fn();
    const setSearchTermMock = jest.fn();
    
    jest.spyOn(React, 'useState').mockImplementation(initial => [initial, setSearchTermMock]);
    
    render(
      <SearchBar 
        placeholder="Search customers..." 
        onSearch={handleSearchMock}
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search customers...');
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    
    expect(setSearchTermMock).toHaveBeenCalledWith('test search');
  });

  it('displays loading state when isLoading is true', () => {
    const useSearchMock = jest.requireMock('../../hooks/useSearch').default;
    useSearchMock.mockImplementation(() => ({
      handleSearch: jest.fn(),
      searchTerm: '',
      setSearchTerm: jest.fn(),
      isLoading: true,
    }));

    render(<SearchBar placeholder="Search customers..." />);
    
    const loadingSpinner = screen.getByTestId('search-loading');
    expect(loadingSpinner).toBeInTheDocument();
  });
});