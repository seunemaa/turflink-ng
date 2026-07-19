import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

import Home from '@/pages/Home';
import Pitches from '@/pages/Pitches';
import PitchDetail from '@/pages/PitchDetail';
import BookPitch from '@/pages/BookPitch';
import BookingConfirmation from '@/pages/BookingConfirmation';
import MyBookings from '@/pages/MyBookings';
import Membership from '@/pages/Membership';
import AuthPage from '@/pages/Auth';
import Admin from '@/pages/Admin';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

function Router() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Navbar />
      <main className="flex-1 w-full">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/pitches" component={Pitches} />
          <Route path="/pitches/:id" component={PitchDetail} />
          <Route path="/book/:pitchId" component={BookPitch} />
          <Route path="/booking/confirm/:reference" component={BookingConfirmation} />
          <Route path="/my-bookings" component={MyBookings} />
          <Route path="/membership" component={Membership} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/admin" component={Admin} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
