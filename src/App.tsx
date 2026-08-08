import { ThemeProvider } from './context/ThemeContext';
import { ExpenseProvider } from './context/ExpenseContext';
import { NavigationShell } from './components/Navigation/NavigationShell';

export function App() {
  return (
    <ThemeProvider>
      <ExpenseProvider>
        <NavigationShell />
      </ExpenseProvider>
    </ThemeProvider>
  );
}

export default App;
