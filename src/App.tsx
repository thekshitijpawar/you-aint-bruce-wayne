import { ThemeProvider } from './context/ThemeContext';
import { ExpenseProvider } from './context/ExpenseContext';
import { SecurityProvider } from './context/SecurityContext';
import { NavigationShell } from './components/Navigation/NavigationShell';

export function App() {
  return (
    <ThemeProvider>
      <ExpenseProvider>
        <SecurityProvider>
          <NavigationShell />
        </SecurityProvider>
      </ExpenseProvider>
    </ThemeProvider>
  );
}

export default App;
