import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Vote, Plus, Trash2, Edit, Users, Loader2, Save } from "lucide-react";
import { ImageUpload } from "./ImageUpload";

interface Election {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface Candidate {
  id: string;
  election_id: string;
  name: string;
  position: string;
  manifesto: string | null;
  image_url: string | null;
  votes_count: number;
  is_active: boolean;
}

export const ElectionsManager = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showElectionForm, setShowElectionForm] = useState(false);
  const [showCandidateForm, setShowCandidateForm] = useState(false);
  const [editingElection, setEditingElection] = useState<Election | null>(null);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [selectedElectionId, setSelectedElectionId] = useState<string | null>(null);

  // Form states
  const [electionForm, setElectionForm] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    is_active: false,
  });

  const [candidateForm, setCandidateForm] = useState({
    name: "",
    position: "",
    manifesto: "",
    image_url: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [electionsRes, candidatesRes] = await Promise.all([
        supabase.from("elections").select("*").order("start_date", { ascending: false }),
        supabase.from("election_candidates").select("*").order("position"),
      ]);

      if (electionsRes.error) throw electionsRes.error;
      if (candidatesRes.error) throw candidatesRes.error;

      setElections((electionsRes.data as Election[]) || []);
      setCandidates((candidatesRes.data as Candidate[]) || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load elections");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveElection = async () => {
    if (!electionForm.title.trim() || !electionForm.start_date || !electionForm.end_date) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      if (editingElection) {
        const { error } = await supabase
          .from("elections")
          .update(electionForm)
          .eq("id", editingElection.id);
        if (error) throw error;
        toast.success("Election updated");
      } else {
        const { error } = await supabase.from("elections").insert(electionForm);
        if (error) throw error;
        toast.success("Election created");
      }

      setShowElectionForm(false);
      setEditingElection(null);
      setElectionForm({ title: "", description: "", start_date: "", end_date: "", is_active: false });
      fetchData();
    } catch (error) {
      console.error("Error saving election:", error);
      toast.error("Failed to save election");
    }
  };

  const handleDeleteElection = async (id: string) => {
    if (!confirm("Delete this election and all its candidates?")) return;

    try {
      const { error } = await supabase.from("elections").delete().eq("id", id);
      if (error) throw error;
      toast.success("Election deleted");
      fetchData();
    } catch (error) {
      console.error("Error deleting election:", error);
      toast.error("Failed to delete election");
    }
  };

  const handleSaveCandidate = async () => {
    if (!candidateForm.name.trim() || !candidateForm.position.trim() || !selectedElectionId) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const data = {
        ...candidateForm,
        election_id: selectedElectionId,
        image_url: candidateForm.image_url || null,
        manifesto: candidateForm.manifesto || null,
      };

      if (editingCandidate) {
        const { error } = await supabase
          .from("election_candidates")
          .update(data)
          .eq("id", editingCandidate.id);
        if (error) throw error;
        toast.success("Candidate updated");
      } else {
        const { error } = await supabase.from("election_candidates").insert(data);
        if (error) throw error;
        toast.success("Candidate added");
      }

      setShowCandidateForm(false);
      setEditingCandidate(null);
      setCandidateForm({ name: "", position: "", manifesto: "", image_url: "" });
      fetchData();
    } catch (error) {
      console.error("Error saving candidate:", error);
      toast.error("Failed to save candidate");
    }
  };

  const handleDeleteCandidate = async (id: string) => {
    if (!confirm("Delete this candidate?")) return;

    try {
      const { error } = await supabase.from("election_candidates").delete().eq("id", id);
      if (error) throw error;
      toast.success("Candidate deleted");
      fetchData();
    } catch (error) {
      console.error("Error deleting candidate:", error);
      toast.error("Failed to delete candidate");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Vote className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Elections Manager</h2>
        </div>
        <Button onClick={() => setShowElectionForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Election
        </Button>
      </div>

      {/* Election Form */}
      {showElectionForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingElection ? "Edit Election" : "Create Election"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={electionForm.title}
                onChange={(e) => setElectionForm({ ...electionForm, title: e.target.value })}
                placeholder="e.g., 2026 Leadership Elections"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={electionForm.description}
                onChange={(e) => setElectionForm({ ...electionForm, description: e.target.value })}
                placeholder="Election description..."
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Start Date *</Label>
                <Input
                  type="datetime-local"
                  value={electionForm.start_date}
                  onChange={(e) => setElectionForm({ ...electionForm, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label>End Date *</Label>
                <Input
                  type="datetime-local"
                  value={electionForm.end_date}
                  onChange={(e) => setElectionForm({ ...electionForm, end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={electionForm.is_active}
                onCheckedChange={(checked) => setElectionForm({ ...electionForm, is_active: checked })}
              />
              <Label>Active (voting open)</Label>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveElection}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={() => {
                setShowElectionForm(false);
                setEditingElection(null);
                setElectionForm({ title: "", description: "", start_date: "", end_date: "", is_active: false });
              }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Candidate Form */}
      {showCandidateForm && selectedElectionId && (
        <Card>
          <CardHeader>
            <CardTitle>{editingCandidate ? "Edit Candidate" : "Add Candidate"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={candidateForm.name}
                  onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
                  placeholder="Candidate name"
                />
              </div>
              <div>
                <Label>Position *</Label>
                <Input
                  value={candidateForm.position}
                  onChange={(e) => setCandidateForm({ ...candidateForm, position: e.target.value })}
                  placeholder="e.g., Chairperson, Secretary"
                />
              </div>
            </div>
            <div>
              <Label>Manifesto</Label>
              <Textarea
                value={candidateForm.manifesto}
                onChange={(e) => setCandidateForm({ ...candidateForm, manifesto: e.target.value })}
                placeholder="Candidate's manifesto..."
              />
            </div>
            <ImageUpload
              label="Candidate Photo"
              value={candidateForm.image_url}
              onChange={(url) => setCandidateForm({ ...candidateForm, image_url: url })}
              folder="candidates"
              square
            />
            <div className="flex gap-2">
              <Button onClick={handleSaveCandidate}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={() => {
                setShowCandidateForm(false);
                setEditingCandidate(null);
                setCandidateForm({ name: "", position: "", manifesto: "", image_url: "" });
              }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Elections List */}
      {elections.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Vote className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No elections created yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {elections.map((election) => {
            const electionCandidates = candidates.filter(c => c.election_id === election.id);
            const totalVotes = electionCandidates.reduce((sum, c) => sum + c.votes_count, 0);

            return (
              <Card key={election.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {election.title}
                        <Badge variant={election.is_active ? "default" : "secondary"}>
                          {election.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(election.start_date).toLocaleDateString()} - {new Date(election.end_date).toLocaleDateString()}
                        <span className="mx-2">•</span>
                        {totalVotes} total votes
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setEditingElection(election);
                          setElectionForm({
                            title: election.title,
                            description: election.description || "",
                            start_date: election.start_date.slice(0, 16),
                            end_date: election.end_date.slice(0, 16),
                            is_active: election.is_active,
                          });
                          setShowElectionForm(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDeleteElection(election.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-foreground">Candidates ({electionCandidates.length})</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedElectionId(election.id);
                        setShowCandidateForm(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Candidate
                    </Button>
                  </div>

                  {electionCandidates.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No candidates yet</p>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {electionCandidates.map((candidate) => (
                        <Card key={candidate.id} className="p-3">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                              {candidate.image_url ? (
                                <img src={candidate.image_url} alt={candidate.name} className="w-full h-full object-cover" />
                              ) : (
                                <Users className="w-5 h-5 text-primary" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-foreground">{candidate.name}</p>
                              <p className="text-xs text-muted-foreground">{candidate.position}</p>
                              <p className="text-xs text-primary mt-1">{candidate.votes_count} votes</p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => {
                                  setSelectedElectionId(election.id);
                                  setEditingCandidate(candidate);
                                  setCandidateForm({
                                    name: candidate.name,
                                    position: candidate.position,
                                    manifesto: candidate.manifesto || "",
                                    image_url: candidate.image_url || "",
                                  });
                                  setShowCandidateForm(true);
                                }}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive"
                                onClick={() => handleDeleteCandidate(candidate.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
