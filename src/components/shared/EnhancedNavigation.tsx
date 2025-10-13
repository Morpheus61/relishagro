import React, { useState } from 'react';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
}

interface EnhancedNavigationProps {
  items: NavigationItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  theme?: string; // Optional theme prop for compatibility
}

const EnhancedNavigation: React.FC<EnhancedNavigationProps> = ({
  items,
  activeTab,
  onTabChange,
  theme = 'default'
}) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  const scrollLeft = () => {
    const newPosition = Math.max(0, scrollPosition - 200);
    setScrollPosition(newPosition);
  };

  const scrollRight = () => {
    const maxScroll = Math.max(0, (items.length * 120) - 600);
    const newPosition = Math.min(maxScroll, scrollPosition + 200);
    setScrollPosition(newPosition);
  };

  // Theme-based styling for different dashboards
  const getThemeClasses = () => {
    switch (theme) {
      case 'green':
        return {
          activeButton: 'bg-green-600 hover:bg-green-700 text-white border-green-600',
          mobileActiveItem: 'bg-green-50 text-green-600 font-medium'
        };
      case 'blue':
        return {
          activeButton: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600',
          mobileActiveItem: 'bg-blue-50 text-blue-600 font-medium'
        };
      case 'purple':
        return {
          activeButton: 'bg-purple-600 hover:bg-purple-700 text-white border-purple-600',
          mobileActiveItem: 'bg-purple-50 text-purple-600 font-medium'
        };
      default:
        return {
          activeButton: 'bg-gray-900 hover:bg-gray-800 text-white border-gray-900',
          mobileActiveItem: 'bg-blue-50 text-blue-600 font-medium'
        };
    }
  };

  const themeClasses = getThemeClasses();

  return (
    <>
      {/* Mobile Navigation */}
      <div className="md:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="w-full flex items-center justify-between"
        >
          <span>{items.find(item => item.id === activeTab)?.label || 'Menu'}</span>
          {showMobileMenu ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
        
        {showMobileMenu && (
          <div className="mt-2 space-y-1 bg-white border rounded-md shadow-lg z-10 absolute left-0 right-0 mx-4">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setShowMobileMenu(false);
                }}
                className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                  activeTab === item.id ? themeClasses.mobileActiveItem : ''
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={scrollLeft}
          disabled={scrollPosition === 0}
          className="mr-2 flex-shrink-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex-1 overflow-hidden">
          <div 
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${scrollPosition}px)` }}
          >
            {items.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "outline"}
                onClick={() => onTabChange(item.id)}
                className={`mr-2 flex-shrink-0 whitespace-nowrap min-w-0 transition-all ${
                  activeTab === item.id ? themeClasses.activeButton : ''
                }`}
                style={{ minWidth: '120px' }}
              >
                <span className="truncate px-1">{item.label}</span>
              </Button>
            ))}
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={scrollRight}
          disabled={scrollPosition >= Math.max(0, (items.length * 120) - 600)}
          className="ml-2 flex-shrink-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
};

export default EnhancedNavigation;