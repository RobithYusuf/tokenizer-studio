# Simulator Components

Reusable components untuk AI Cost Simulator yang telah di-refactor dari `VolumeSimulatorPageV2.tsx` (1819 lines → modular components).

## 📦 Components

### 1. **ModalitySelector**
Komponen untuk memilih AI capability (text-to-text, text-to-image, dll).

**Props:**
```typescript
{
  selectedModality: AIModality;
  onModalityChange: (modality: AIModality) => void;
  modalityDetails?: {
    name: string;
    description: string;
    examples: string[];
  };
}
```

**Features:**
- Grid responsive (2-3-6 columns)
- Visual feedback dengan icon dan checkmark
- Menampilkan examples untuk modality yang dipilih
- Hover states dan transitions

**Usage:**
```tsx
<ModalitySelector
  selectedModality={modality}
  onModalityChange={setModality}
  modalityDetails={modalityInfo}
/>
```

---

### 2. **ComplexitySelector**
Komponen untuk memilih complexity level (light, medium, heavy) dengan preview biaya.

**Props:**
```typescript
{
  selectedComplexity: 'light' | 'medium' | 'heavy';
  onComplexityChange: (complexity: ComplexityLevel) => void;
  complexityOptions: Record<ComplexityLevel, ComplexityOption>;
  complexityCosts?: Record<ComplexityLevel, number>;
  currency?: 'IDR' | 'USD';
}
```

**Features:**
- Menampilkan deskripsi untuk setiap level
- Preview biaya per request (optional)
- Support IDR dan USD
- Visual active state

**Usage:**
```tsx
<ComplexitySelector
  selectedComplexity={complexity}
  onComplexityChange={setComplexity}
  complexityOptions={modalityDetails.defaultComplexity}
  complexityCosts={costsByComplexity}
  currency="IDR"
/>
```

---

### 3. **ModelSelector**
Komponen untuk memilih AI model dengan search dan grouping by provider.

**Props:**
```typescript
{
  models: Model[];
  groupedModels: Record<string, Model[]>;
  selectedModelName: string;
  searchQuery: string;
  onModelChange: (modelName: string) => void;
  onSearchChange: (query: string) => void;
  modalityName?: string;
  className?: string;
}
```

**Features:**
- Search functionality
- Group by provider dengan collapsible sections
- Badge untuk source (AA, OR, AIML, HC)
- Format pricing otomatis (tokens, images, seconds, chars)
- Scrollable list (max-height: 400px)
- Empty state handling

**Usage:**
```tsx
<ModelSelector
  models={filteredModels}
  groupedModels={groupedByProvider}
  selectedModelName={modelName}
  searchQuery={searchQuery}
  onModelChange={setModelName}
  onSearchChange={setSearchQuery}
  modalityName="text-to-text models"
/>
```

---

### 4. **CostFactorsDisclaimer**
Komponen untuk menampilkan disclaimer tentang akurasi pricing dan faktor-faktor yang mempengaruhi biaya.

**Props:** None (stateless component)

**Features:**
- Menampilkan 4 data sources
- List 8 faktor yang mengurangi biaya (caching, batch API, dll)
- List 9 faktor yang meningkatkan biaya (rate limits, markup, dll)
- Best practice recommendations
- Color-coded sections (amber untuk accuracy, blue untuk cost factors)

**Usage:**
```tsx
<CostFactorsDisclaimer />
```

---

## 🎯 Benefits

### Before Refactoring:
- ❌ **VolumeSimulatorPageV2.tsx**: 1819 lines (unmaintainable)
- ❌ Repeated code untuk Budget & Volume modes
- ❌ Complex logic tercampur dengan UI
- ❌ Sulit untuk test individual components
- ❌ Sulit untuk reuse di halaman lain

### After Refactoring:
- ✅ **4 reusable components** (100-200 lines each)
- ✅ Clear separation of concerns
- ✅ Easy to test independently
- ✅ Can be reused in other pages
- ✅ Better TypeScript types
- ✅ Improved maintainability

---

## 📁 File Structure

```
components/
└── simulator/
    ├── ModalitySelector.tsx       (61 lines)
    ├── ComplexitySelector.tsx     (72 lines)
    ├── ModelSelector.tsx          (165 lines)
    ├── CostFactorsDisclaimer.tsx  (94 lines)
    └── README.md                  (this file)
```

---

## 🔄 Next Steps

1. **Create Custom Hooks:**
   - `useModelSelection.ts` - Model filtering and search logic
   - `useBudgetSimulator.ts` - Budget calculation logic
   - `useVolumeSimulator.ts` - Volume calculation logic

2. **Split Main Page:**
   - Keep `VolumeSimulatorPageV2.tsx` but use new components
   - Reduce from 1819 lines to ~400-500 lines
   - Or split into `BudgetSimulatorPage.tsx` + `VolumeSimulatorPage.tsx`

3. **Add Unit Tests:**
   - Test each component independently
   - Test props and callbacks
   - Test edge cases

---

## 💡 Usage Examples

### Full Simulator Flow:
```tsx
import ModalitySelector from './components/simulator/ModalitySelector';
import ModelSelector from './components/simulator/ModelSelector';
import ComplexitySelector from './components/simulator/ComplexitySelector';
import CostFactorsDisclaimer from './components/simulator/CostFactorsDisclaimer';

function SimulatorPage() {
  // Step 1: Select AI Capability
  <ModalitySelector
    selectedModality={modality}
    onModalityChange={setModality}
    modalityDetails={modalityInfo}
  />

  // Step 2: Choose Model
  <ModelSelector
    models={filteredModels}
    groupedModels={groupedModels}
    selectedModelName={modelName}
    searchQuery={searchQuery}
    onModelChange={setModelName}
    onSearchChange={setSearchQuery}
  />

  // Step 3: Select Complexity
  <ComplexitySelector
    selectedComplexity={complexity}
    onComplexityChange={setComplexity}
    complexityOptions={modalityInfo.defaultComplexity}
    complexityCosts={costs}
  />

  // ... (Results section)

  // Disclaimers at bottom
  <CostFactorsDisclaimer />
}
```

---

## 🎨 Design Principles

1. **Single Responsibility:** Each component has one clear purpose
2. **Composition:** Components can be composed together
3. **Controlled Components:** Parent manages state via props
4. **TypeScript First:** Strong typing for all props
5. **Accessibility:** Proper ARIA labels and keyboard navigation
6. **Responsive:** Mobile-first design with breakpoints
7. **Performance:** Minimal re-renders with proper memoization

---

## 📝 Notes

- All components use Tailwind CSS for styling
- Icons use inline SVG for better performance
- Components are fully TypeScript typed
- No external dependencies beyond React and Tailwind
- Follows existing codebase conventions

