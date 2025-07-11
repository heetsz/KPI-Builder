import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { 
  ArrowRight, 
  ArrowUpRight,
  TrendingUp,
  Lightbulb,
  LayoutDashboard,
  Mail,
  Target,
  PieChart,
  BarChart
} from "lucide-react";
import sptbiLogo from "../assets/sptbilogo.svg";

const LandingPage = () => {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative isolate px-6 lg:px-8 border-b border-border/40">
        <nav className="mx-auto max-w-7xl flex items-center justify-between py-6">
          <a href="https://www.sptbi.com/" target="_blank" rel="noopener noreferrer">
            <img src={sptbiLogo} alt="SPTBI Logo" className="h-8 w-auto" />
          </a>
          <div className="flex items-center gap-4">
            <Link
              to="/auth/login"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/auth/signup"
              className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </nav>

        <div className="mx-auto max-w-4xl py-32">
          <div className="text-center">
            <motion.h1 
              className="text-4xl font-bold tracking-tight sm:text-6xl bg-clip-text text-transparent py-2.5 bg-gradient-to-r from-primary to-primary/60"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Dhruvaa — Empowering Startups with Intelligent Metric Tracking
            </motion.h1>
            <motion.p 
              className="mt-6 text-lg leading-8 text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Transform your startup's data into actionable insights with our intuitive dashboard platform. 
              Visualize trends, monitor growth patterns, and accelerate your business with data you can trust.
            </motion.p>
            <motion.div 
              className="mt-10 flex items-center justify-center gap-x-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link
                to="/auth/signup"
                className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors flex items-center gap-2"
              >
                Get Started <ArrowUpRight className="h-4 w-4" />
              </Link>
              <a
                href="#how-it-works"
                className="text-sm font-semibold leading-6 text-foreground flex items-center gap-2 hover:text-primary transition-colors"
              >
                Learn more <ArrowRight className="h-4 w-4" />
              </a>
            </motion.div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute inset-x-0 top-28 -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-primary/30 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>
      </header>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold leading-7 text-primary">
              Your Journey with Dhruvaa
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Three steps to data excellence
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {howItWorks.map((step, index) => (
                <motion.div
                  key={step.name}
                  className={`flex flex-col ${theme.border} rounded-lg p-6 border relative`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground mt-4">
                    {step.icon}
                    {step.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                    <p className="flex-auto">{step.description}</p>
                  </dd>
                </motion.div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={`${theme.cardBg} py-24 sm:py-32 border-y border-border/40`}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary">
              Powerful Capabilities
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Take your startup to new heights with these powerful tools
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {features.map((feature) => (
                <motion.div 
                  key={feature.name} 
                  className={`flex flex-col ${theme.border} rounded-lg p-6 border hover:border-primary transition-colors group`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                    <div className="rounded-lg bg-primary/10 p-2 group-hover:bg-primary/20 transition-colors">
                      {feature.icon}
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </motion.div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center mb-16">
            <h2 className="text-base font-semibold leading-7 text-primary">
              Success Stories
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              What Our Innovation Partners Say
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                className={`${theme.border} rounded-lg p-6 border`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <p className="text-lg text-muted-foreground mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {testimonial.author[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`${theme.cardBg} border-t border-border/40 py-16`}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div>
              <a href="https://www.sptbi.com/" target="_blank" rel="noopener noreferrer">
                <img src={sptbiLogo} alt="SPTBI Logo" className="h-8 w-auto mb-6" />
              </a>
              <p className="text-sm text-muted-foreground max-w-sm">
              Sardar Patel Technology Business Incubator (SP-TBI) is an incubation centre founded in 2015 as an initiative of Bhartiya Vidya Bhavan's Sardar Patel Institute of Technology and is affiliated with the Department of Science and Technology, Government of India.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Your Journey
                  </a>
                </li>
                <li>
                  <a href="#features" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Capabilities
                  </a>
                </li>
                <li>
                  <Link to="/auth/signup" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Contact Us</h3>
              <div className="space-y-3">
                <a 
                  href="mailto:managertbi@spit.ac.in"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  managertbi@spit.ac.in
                </a>
                <p className="text-sm text-muted-foreground">
                  Bhavan's Campus, Old D N Nagar,<br />
                  Munshi Nagar, Andheri West,<br />
                  Mumbai, Maharashtra 400058
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Dhruvaa. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

const howItWorks = [
  {
    name: 'Onboard & Connect',
    description: 'Set up your profile in minutes and fill your company information with secure, one-click integrations.',
    icon: <Lightbulb className="h-5 w-5 text-primary" />,
  },
  {
    name: 'Seamless Data Integration',
    description: 'Choose from industry-tested templates to fill your data for your KPIs.',
    icon: <LayoutDashboard className="h-5 w-5 text-primary" />,
  },
  {
    name: 'Visualize & Analyze',
    description: 'Use our intuitive dashboard to visualize your data and gain insights that drive your business forward.',
    icon: <Target className="h-5 w-5 text-primary" />,
  },
];

const features = [
  {
    name: 'Dynamic Visualizations',
    description: 'Transform complex data into clear, actionable visuals with customizable charts, graphs, and performance indicators.',
    icon: <PieChart className="h-5 w-5 text-primary" />,
  },
  {
    name: 'Cross-functional Analytics',
    description: 'Break down silos with unified metrics across Marketing, Finance, Product, and Customer Success teams.',
    icon: <BarChart className="h-5 w-5 text-primary" />,
  },
  {
    name: 'Predictive Insights',
    description: 'Stay ahead of the curve with ML-powered forecasting and trend identification to guide future planning.',
    icon: <TrendingUp className="h-5 w-5 text-primary" />,
  },
];

const testimonials = [
  {
    quote: "Dhruvaa transformed our decision-making process completely. We can now pinpoint exactly where to focus our resources for maximum impact.",
    author: "Priya Sharma",
    role: "Founder, NeuralHealth"
  },
  {
    quote: "The cross-functional analytics helped us align our teams around common goals. Our quarterly planning is now backed by solid data we can all trust.",
    author: "Rahul Verma",
    role: "CTO, FarmTech Solutions"
  }
];

export default LandingPage;
