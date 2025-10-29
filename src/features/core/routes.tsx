import { lazy } from 'react';
import { type RouteObject } from 'react-router-dom';
import CoreFeatureWrapper from './components/CoreFeatureWrapper';

// Lazy load core components from local feature directory
const LandingPage = lazy(() => import('./components/LandingPage'));
const HowItWorksPage = lazy(() => import('./components/HowItWorksPage'));

export const coreRoutes: RouteObject[] = [
  {
    path: '/',
    element: (
      <CoreFeatureWrapper>
        <LandingPage />
      </CoreFeatureWrapper>
    ),
  },
  {
    path: '/how-it-works',
    element: (
      <CoreFeatureWrapper>
        <HowItWorksPage />
      </CoreFeatureWrapper>
    ),
  },
];

export default coreRoutes;
