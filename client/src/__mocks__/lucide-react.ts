import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement> & { 'data-testid'?: string };

const createIcon = (name: string) => (props: IconProps) => React.createElement('svg', { 'data-testid': name, ...props });

export const Search = createIcon('Search');
export const MapPin = createIcon('MapPin');
export const ChevronDown = createIcon('ChevronDown');
export const ChevronUp = createIcon('ChevronUp');
export const ArrowRight = createIcon('ArrowRight');
export const ShoppingBag = createIcon('ShoppingBag');
export const Car = createIcon('Car');
export const Home = createIcon('Home');
export const Sofa = createIcon('Sofa');
export const Smartphone = createIcon('Smartphone');
export const Briefcase = createIcon('Briefcase');
export const Music = createIcon('Music');
export const TrendingUp = createIcon('TrendingUp');
export const Star = createIcon('Star');
export const Zap = createIcon('Zap');
export const ShieldCheck = createIcon('ShieldCheck');
export const LayoutDashboard = createIcon('LayoutDashboard');
export const MessageSquare = createIcon('MessageSquare');
export const UploadCloud = createIcon('UploadCloud');
export const LogIn = createIcon('LogIn');
export const User = createIcon('User');
export const Globe = createIcon('Globe');
export const AtSign = createIcon('AtSign');
export const Share2 = createIcon('Share2');
export const Phone = createIcon('Phone');
export const Mail = createIcon('Mail');
export const MapPinOutlined = createIcon('MapPinOutlined');

const MockedIcons = {
  Search,
  MapPin,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShoppingBag,
  Car,
  Home,
  Sofa,
  Smartphone,
  Briefcase,
  Music,
  TrendingUp,
  Star,
  Zap,
  ShieldCheck,
  LayoutDashboard,
  MessageSquare,
  UploadCloud,
  LogIn,
  User,
  Globe,
  AtSign,
  Share2,
  Phone,
  Mail,
  MapPinOutlined,
};

export default MockedIcons;
