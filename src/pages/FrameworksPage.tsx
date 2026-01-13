import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, Grid3X3, Target, AlertTriangle, BarChart3, 
  Clock, Trash2, ChevronRight, Sparkles 
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface FrameworkAnalysis {
  id: string;
  framework_type: string;
  title: string | null;
  inputs: Record<string, unknown>;
  ai_enhancement: Record<string, unknown> | null;
  created_at: string;
}

const frameworkTypes = [
  {
    id: "swot",
    name: "SWOT Analysis",
    description: "Strengths, Weaknesses, Opportunities, Threats",
    icon: Grid3X3,
    color: "bg-blue-500",
  },
  {
    id: "porter",
    name: "Porter's Five Forces",
    description: "Competitive analysis framework",
    icon: Target,
    color: "bg-purple-500",
  },
  {
    id: "premortem",
    name: "Pre-Mortem",
    description: "Anticipate failure before it happens",
    icon: AlertTriangle,
    color: "bg-amber-500",
  },
];

export default function FrameworksPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [analyses, setAnalyses] = useState<FrameworkAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchAnalyses();
    }
  }, [user]);

  const fetchAnalyses = async () => {
    const { data, error } = await supabase
      .from("framework_analyses")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load frameworks");
    } else {
      setAnalyses(data as FrameworkAnalysis[]);
    }
    setIsLoading(false);
  };

  const deleteAnalysis = async (id: string) => {
    const { error } = await supabase
      .from("framework_analyses")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete");
    } else {
      setAnalyses(analyses.filter((a) => a.id !== id));
      toast.success("Framework deleted");
    }
  };

  const filteredAnalyses = activeTab === "all" 
    ? analyses 
    : analyses.filter((a) => a.framework_type === activeTab);

  const getFrameworkInfo = (type: string) => 
    frameworkTypes.find((f) => f.id === type) || frameworkTypes[0];

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Business Frameworks</h1>
          <p className="text-muted-foreground">
            Strategic analysis tools with AI enhancement
          </p>
        </div>
      </div>

      {/* Framework Templates */}
      <div className="grid gap-4 md:grid-cols-3">
        {frameworkTypes.map((framework) => (
          <Card 
            key={framework.id}
            className="cursor-pointer hover:shadow-md transition-shadow group"
            onClick={() => navigate(`/frameworks/${framework.id}/new`)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${framework.color} text-white`}>
                  <framework.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">{framework.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {framework.description}
                  </CardDescription>
                </div>
                <Plus className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Saved Analyses */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your Analyses</h2>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-8">
              <TabsTrigger value="all" className="text-xs px-3">All</TabsTrigger>
              <TabsTrigger value="swot" className="text-xs px-3">SWOT</TabsTrigger>
              <TabsTrigger value="porter" className="text-xs px-3">Porter</TabsTrigger>
              <TabsTrigger value="premortem" className="text-xs px-3">Pre-Mortem</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {filteredAnalyses.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-medium mb-1">No analyses yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first strategic analysis
              </p>
              <Button onClick={() => navigate("/frameworks/swot/new")}>
                <Plus className="h-4 w-4 mr-2" />
                New SWOT Analysis
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {filteredAnalyses.map((analysis) => {
              const info = getFrameworkInfo(analysis.framework_type);
              return (
                <Card 
                  key={analysis.id}
                  className="cursor-pointer hover:shadow-sm transition-shadow"
                  onClick={() => navigate(`/frameworks/${analysis.framework_type}/${analysis.id}`)}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className={`p-2 rounded-lg ${info.color} text-white`}>
                      <info.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">
                          {analysis.title || `${info.name} Analysis`}
                        </h3>
                        {analysis.ai_enhancement && (
                          <Badge variant="secondary" className="text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI Enhanced
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(analysis.created_at), "MMM d, yyyy")}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAnalysis(analysis.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
