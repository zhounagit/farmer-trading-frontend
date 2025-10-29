# Component Architecture Implementation Guide

## Overview
This guide explains how to use the new component architecture implemented in Phase 4. The architecture provides a scalable, maintainable system for building UI components with clear separation of concerns.

## Quick Start

### Basic Component Usage
```typescript
import { Button, Card, Stack } from '../../shared/components';

// Use the design system components
function MyComponent() {
  return (
    <Card title="Example Card" variant="outlined">
      <Stack spacing={2}>
        <Button variant="primary" onClick={handleClick}>
          Primary Action
        </Button>
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
      </Stack>
    </Card>
  );
}
```

### Feature-Specific Components
```typescript
import { 
  StorefrontTabs,
  useStorefrontEditor 
} from '../../features/storefront';

function CustomStorefrontPage() {
  const editor = useStorefrontEditor();
  
  return (
    <StorefrontTabs
      storeData={editor.storeData}
      selectedTheme={editor.selectedTheme}
      onThemeChange={editor.setSelectedTheme}
      // ... other props
    />
  );
}
```

## Architecture Overview

```
src/
├── shared/components/           # Design System (Reusable UI)
│   ├── ui/                     # Base components
│   ├── layout/                 # Layout primitives
│   ├── forms/                  # Form components
│   └── feedback/               # Loading & error states
└── features/                   # Feature-specific components
    └── {feature}/
        ├── components/         # Feature UI components
        ├── hooks/             # Business logic hooks
        └── services/          # API services
```

## Design System Components

### UI Components (`shared/components/ui/`)

#### Button
```typescript
import { Button } from '../../shared/components';

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>

// Sizes
<Button size="small">Small</Button>
<Button size="medium">Medium</Button>
<Button size="large">Large</Button>

// States
<Button loading={true}>Loading...</Button>
<Button disabled={true}>Disabled</Button>

// With icons
<Button startIcon={<Save />}>Save</Button>
<Button endIcon={<ArrowForward />}>Continue</Button>
```

#### Input
```typescript
import { Input } from '../../shared/components';

// Basic input
<Input
  label="Email"
  placeholder="Enter your email"
  required
/>

// Password with toggle
<Input
  type="password"
  label="Password"
  showPasswordToggle
/>

// With validation
<Input
  label="Name"
  error={!!errors.name}
  helperText={errors.name?.message}
/>

// With adornments
<Input
  label="Price"
  startAdornment="$"
  endAdornment="USD"
/>
```

#### Card
```typescript
import { Card } from '../../shared/components';

// Basic card
<Card title="Card Title" subtitle="Optional subtitle">
  Card content goes here
</Card>

// With actions
<Card
  title="Settings"
  actions={
    <Button variant="outline">Edit</Button>
  }
>
  Settings content
</Card>

// Variants
<Card variant="elevated">Elevated card</Card>
<Card variant="outlined">Outlined card</Card>
<Card variant="filled">Filled card</Card>

// Padding options
<Card padding="none">No padding</Card>
<Card padding="small">Small padding</Card>
<Card padding="large">Large padding</Card>
```

### Layout Components (`shared/components/layout/`)

#### Container
```typescript
import { Container } from '../../shared/components';

// Responsive container
<Container maxWidth="lg">
  Content with max width
</Container>

// Full width
<Container maxWidth="fluid">
  Full width content
</Container>

// Custom padding
<Container padding="large">
  Content with large padding
</Container>
```

#### Stack
```typescript
import { Stack } from '../../shared/components';

// Vertical stack (default)
<Stack spacing={2}>
  <div>Item 1</div>
  <div>Item 2</div>
</Stack>

// Horizontal stack
<Stack direction="row" spacing={1}>
  <Button>Button 1</Button>
  <Button>Button 2</Button>
</Stack>

// With divider
<Stack spacing={2} divider={<Divider />}>
  <div>Section 1</div>
  <div>Section 2</div>
</Stack>

// Alignment
<Stack 
  direction="row" 
  justifyContent="space-between"
  alignItems="center"
>
  <Typography>Title</Typography>
  <Button>Action</Button>
</Stack>
```

### Form Components (`shared/components/forms/`)

#### FormField with React Hook Form
```typescript
import { useForm, Controller } from 'react-hook-form';
import { FormField, Input } from '../../shared/components';

function MyForm() {
  const { control, handleSubmit } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField
        name="email"
        control={control}
        label="Email Address"
        rules={{ required: 'Email is required' }}
      >
        <Input type="email" />
      </FormField>
    </form>
  );
}
```

### Feedback Components (`shared/components/feedback/`)

#### Loading States
```typescript
import { Loading } from '../../shared/components';

// Circular loading
<Loading variant="circular" text="Loading..." />

// Linear progress
<Loading variant="linear" />

// Skeleton placeholder
<Loading variant="skeleton" rows={3} />

// Full screen loading
<Loading variant="circular" fullScreen />

// Overlay loading
<Loading variant="overlay">
  <YourContent />
</Loading>
```

#### Error Display
```typescript
import { ErrorDisplay } from '../../shared/components';

// Basic error
<ErrorDisplay
  variant="error"
  title="Something went wrong"
  message="Please try again later"
/>

// With retry action
<ErrorDisplay
  variant="error"
  message="Failed to load data"
  showRetry
  onRetry={handleRetry}
/>

// Different severities
<ErrorDisplay variant="warning" message="Warning message" />
<ErrorDisplay variant="info" message="Info message" />
<ErrorDisplay variant="success" message="Success message" />
```

## Custom Hooks Pattern

### Creating Business Logic Hooks
```typescript
// hooks/useFeatureEditor.ts
export const useFeatureEditor = (featureId: string) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const save = useCallback(async () => {
    setLoading(true);
    try {
      await api.save(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [data]);

  return {
    data,
    setData,
    loading,
    error,
    save,
  };
};
```

### Using Custom Hooks
```typescript
function FeatureEditor({ featureId }) {
  const {
    data,
    setData,
    loading,
    error,
    save
  } = useFeatureEditor(featureId);

  if (loading) return <Loading />;
  if (error) return <ErrorDisplay message={error} />;

  return (
    <Card title="Feature Editor">
      {/* Your form components */}
      <Button onClick={save} loading={loading}>
        Save Changes
      </Button>
    </Card>
  );
}
```

## Compound Component Pattern

### Creating Compound Components
```typescript
// components/Tabs.tsx
interface TabsContextValue {
  activeTab: number;
  setActiveTab: (tab: number) => void;
}

const TabsContext = React.createContext<TabsContextValue>();

const Tabs: React.FC<TabsProps> & {
  TabList: typeof TabList;
  Tab: typeof Tab;
  TabPanels: typeof TabPanels;
  TabPanel: typeof TabPanel;
} = ({ children, defaultTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
};

const TabList = ({ children }) => {
  return <div className="tab-list">{children}</div>;
};

const Tab = ({ index, children }) => {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  return (
    <button 
      className={activeTab === index ? 'active' : ''}
      onClick={() => setActiveTab(index)}
    >
      {children}
    </button>
  );
};

// Attach components
Tabs.TabList = TabList;
Tabs.Tab = Tab;
// ... other subcomponents

export default Tabs;
```

### Using Compound Components
```typescript
<Tabs defaultTab={0}>
  <Tabs.TabList>
    <Tabs.Tab index={0}>Tab 1</Tabs.Tab>
    <Tabs.Tab index={1}>Tab 2</Tabs.Tab>
  </Tabs.TabList>
  
  <Tabs.TabPanels>
    <Tabs.TabPanel index={0}>Panel 1 content</Tabs.TabPanel>
    <Tabs.TabPanel index={1}>Panel 2 content</Tabs.TabPanel>
  </Tabs.TabPanels>
</Tabs>
```

## Component Composition Patterns

### Higher-Order Components for Common Functionality
```typescript
// hoc/withLoading.tsx
export function withLoading<T extends object>(
  Component: React.ComponentType<T>
) {
  return (props: T & { loading?: boolean }) => {
    const { loading, ...componentProps } = props;
    
    if (loading) {
      return <Loading variant="overlay"><Component {...componentProps as T} /></Loading>;
    }
    
    return <Component {...componentProps as T} />;
  };
}

// Usage
const LoadableDataTable = withLoading(DataTable);

<LoadableDataTable data={data} loading={isLoading} />
```

### Render Props Pattern
```typescript
// components/DataFetcher.tsx
interface DataFetcherProps<T> {
  url: string;
  children: (data: {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
  }) => React.ReactNode;
}

function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(url);
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return <>{children({ data, loading, error, refetch: fetchData })}</>;
}

// Usage
<DataFetcher<User[]> url="/api/users">
  {({ data, loading, error, refetch }) => {
    if (loading) return <Loading />;
    if (error) return <ErrorDisplay message={error} onRetry={refetch} />;
    
    return (
      <div>
        {data?.map(user => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    );
  }}
</DataFetcher>
```

## Type Safety Best Practices

### Component Prop Types
```typescript
// Always define comprehensive prop interfaces
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  fullWidth?: boolean;
}

// Use generic types for reusable components
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  loading?: boolean;
}

function DataTable<T>({ data, columns, onRowClick, loading }: DataTableProps<T>) {
  // Component implementation
}
```

### Custom Hook Types
```typescript
// Define return types for hooks
interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  mutate: (newData: T) => Promise<void>;
  refetch: () => Promise<void>;
}

function useApi<T>(url: string): UseApiReturn<T> {
  // Hook implementation
}
```

## Performance Optimization

### React.memo for Pure Components
```typescript
interface ExpensiveComponentProps {
  data: ComplexData[];
  onUpdate: (id: string, data: ComplexData) => void;
}

const ExpensiveComponent = React.memo<ExpensiveComponentProps>(
  ({ data, onUpdate }) => {
    // Expensive rendering logic
  },
  (prevProps, nextProps) => {
    // Custom comparison function
    return (
      prevProps.data.length === nextProps.data.length &&
      prevProps.data.every((item, index) => 
        item.id === nextProps.data[index]?.id &&
        item.updatedAt === nextProps.data[index]?.updatedAt
      )
    );
  }
);
```

### useMemo and useCallback
```typescript
function OptimizedComponent({ items, filters, onItemClick }) {
  // Memoize expensive computations
  const filteredItems = useMemo(() => {
    return items.filter(item => 
      filters.every(filter => filter.test(item))
    );
  }, [items, filters]);

  // Memoize callbacks to prevent child re-renders
  const handleItemClick = useCallback((item) => {
    onItemClick(item.id, item);
  }, [onItemClick]);

  return (
    <div>
      {filteredItems.map(item => (
        <ItemCard 
          key={item.id} 
          item={item} 
          onClick={handleItemClick} 
        />
      ))}
    </div>
  );
}
```

## Testing Patterns

### Component Testing
```typescript
// MyComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<MyComponent onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Hook Testing
```typescript
// useMyHook.test.ts
import { renderHook, act } from '@testing-library/react';
import useMyHook from './useMyHook';

describe('useMyHook', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => useMyHook());
    
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('handles data updates', async () => {
    const { result } = renderHook(() => useMyHook());
    
    await act(async () => {
      result.current.updateData({ id: 1, name: 'Test' });
    });
    
    expect(result.current.data).toEqual({ id: 1, name: 'Test' });
  });
});
```

## Accessibility Guidelines

### Semantic HTML
```typescript
// Use proper semantic elements
function Navigation() {
  return (
    <nav role="navigation" aria-label="Main navigation">
      <ul>
        <li><a href="/home">Home</a></li>
        <li><a href="/about">About</a></li>
      </ul>
    </nav>
  );
}
```

### ARIA Attributes
```typescript
// Provide proper ARIA labels and descriptions
<Button
  aria-label="Close dialog"
  aria-describedby="close-dialog-description"
  onClick={onClose}
>
  <CloseIcon />
</Button>

<div id="close-dialog-description" className="sr-only">
  This will close the dialog and discard any unsaved changes
</div>
```

### Focus Management
```typescript
function Modal({ isOpen, onClose }) {
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      }}
    >
      {/* Modal content */}
    </div>
  );
}
```

## Migration from Legacy Components

### Step-by-Step Migration
1. **Identify the component**: Find the monolithic component to refactor
2. **Extract business logic**: Move state and API calls to custom hooks
3. **Create section components**: Break UI into focused components
4. **Implement compound pattern**: Create flexible composition interface
5. **Update imports**: Switch to new component paths
6. **Test thoroughly**: Ensure functionality is preserved

### Example Migration
```typescript
// Before: Monolithic component (1000+ lines)
function LegacyPage() {
  // 50+ state variables
  // 20+ API calls
  // Complex rendering logic
  return (
    <div>
      {/* Massive JSX with mixed concerns */}
    </div>
  );
}

// After: Composed architecture
function ModernPage() {
  const editor = usePageEditor(); // Business logic extracted
  
  return (
    <Container>
      <PageHeader {...editor.headerProps} />
      <PageTabs>
        <PageTabs.SettingsSection {...editor.settingsProps} />
        <PageTabs.ContentSection {...editor.contentProps} />
        <PageTabs.PreviewSection {...editor.previewProps} />
      </PageTabs>
    </Container>
  );
}
```

## Common Pitfalls and Solutions

### Prop Drilling
```typescript
// ❌ Prop drilling through multiple levels
function App() {
  const [user, setUser] = useState();
  return <Layout user={user} setUser={setUser} />;
}

function Layout({ user, setUser }) {
  return <Sidebar user={user} setUser={setUser} />;
}

// ✅ Use context for shared state
const UserContext = createContext();

function App() {
  const [user, setUser] = useState();
  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Layout />
    </UserContext.Provider>
  );
}
```

### Over-composition
```typescript
// ❌ Too many small components
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardSubtitle>Subtitle</CardSubtitle>
  </CardHeader>
  <CardContent>
    <CardText>Content</CardText>
  </CardContent>
</Card>

// ✅ Balanced composition
<Card 
  title="Title" 
  subtitle="Subtitle"
>
  Content
</Card>
```

## Conclusion

This architecture provides a solid foundation for building scalable React applications. The key principles are:

1. **Single Responsibility**: Each component has one clear purpose
2. **Composition over Inheritance**: Build complex UIs from simple components
3. **Custom Hooks**: Extract business logic for reusability
4. **Type Safety**: Use TypeScript for better developer experience
5. **Performance**: Optimize with memoization and proper patterns

Follow these patterns consistently to maintain a clean, scalable codebase that's easy for teams to work with.