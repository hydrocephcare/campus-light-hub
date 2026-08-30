import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Vote, Users, Calendar, CheckCircle, Loader2, AlertCircle, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { useSEO } from "@/hooks/useSEO";

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
}

const Elections = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [voterId, setVoterId] = useState("");
  const [hasVoted, setHasVoted] = useState<Record<string, boolean>>({});
  const [isVoting, setIsVoting] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);

  useSEO({
    title: "MKUCU Elections — Vote for Your Leaders",
    description: "Cast your vote in MKU Christian Union elections. Choose leaders who will guide our faith community.",
    image: "https://images.unsplash.com/photo-1494172961521-33799ddd43a5?auto=format&fit=crop&w=1200&q=80",
    url: "https://mkucuu.lovable.app/elections",
  });

  useEffect(() => {
    fetchElections();

    const channel = supabase
      .channel('election-votes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'election_candidates' }, () => fetchElections())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'election_votes' }, () => fetchElections())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchElections = async () => {
    try {
      const [electionsRes, candidatesRes] = await Promise.all([
        supabase.from("elections").select("*").order("start_date", { ascending: false }),
        supabase.from("election_candidates").select("*").eq("is_active", true).order("position"),
      ]);
      if (electionsRes.error) throw electionsRes.error;
      if (candidatesRes.error) throw candidatesRes.error;
      setElections((electionsRes.data as Election[]) || []);
      setCandidates((candidatesRes.data as Candidate[]) || []);
    } catch (error) {
      console.error("Error fetching elections:", error);
      toast.error("Failed to load elections");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (candidateId: string, electionId: string) => {
    if (!voterId.trim()) {
      toast.error("Please enter your student email or phone number");
      return;
    }
    setIsVoting(true);
    try {
      const { data: existing } = await supabase
        .from("election_votes")
        .select("id")
        .eq("election_id", electionId)
        .eq("voter_identifier", voterId.trim().toLowerCase())
        .maybeSingle();

      if (existing) {
        setHasVoted(prev => ({ ...prev, [electionId]: true }));
        toast.error("You have already voted in this election");
        return;
      }

      const { error: voteError } = await supabase.from("election_votes").insert({
        election_id: electionId,
        candidate_id: candidateId,
        voter_identifier: voterId.trim().toLowerCase(),
      });

      if (voteError) {
        if (voteError.code === "23505") {
          toast.error("You have already voted");
          setHasVoted(prev => ({ ...prev, [electionId]: true }));
        } else throw voteError;
        return;
      }

      const candidate = candidates.find(c => c.id === candidateId);
      if (candidate) {
        await supabase.from("election_candidates").update({ votes_count: candidate.votes_count + 1 }).eq("id", candidateId);
      }

      toast.success("Vote cast successfully!");
      setHasVoted(prev => ({ ...prev, [electionId]: true }));
      setSelectedCandidate(null);
      fetchElections();
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Failed to cast vote");
    } finally {
      setIsVoting(false);
    }
  };

  const getStatus = (e: Election) => {
    const now = new Date();
    const start = new Date(e.start_date);
    const end = new Date(e.end_date);
    if (now < start) return { label: "Upcoming", cls: "bg-blue-500/10 text-blue-600 border-blue-200" };
    if (now > end) return { label: "Ended", cls: "bg-muted text-muted-foreground" };
    if (e.is_active) return { label: "Active — Vote Now", cls: "bg-green-500/10 text-green-600 border-green-200" };
    return { label: "Closed", cls: "bg-muted text-muted-foreground" };
  };

  const getCandidates = (eid: string) => candidates.filter(c => c.election_id === eid);
  const getPositions = (eid: string) => [...new Set(getCandidates(eid).map(c => c.position))];
  const getTotalVotes = (eid: string) => getCandidates(eid).reduce((s, c) => s + c.votes_count, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative min-h-[45vh] md:min-h-[55vh] flex items-end overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1494172961521-33799ddd43a5?auto=format&fit=crop&w=1920&q=60"
              alt="Elections"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-black/60 to-black/30" />
          </div>
          <div className="container mx-auto px-4 relative z-10 pb-10 md:pb-14">
            <div className="inline-flex items-center gap-2 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-sm font-medium mb-4">
              <Vote className="w-4 h-4" /> CU Elections
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-3">
              MKUCU Elections
            </h1>
            <p className="text-base md:text-lg text-white/80 max-w-2xl">
              Exercise your right to vote and choose leaders who will guide our Christian Union
            </p>
          </div>
        </section>

        <section className="py-10 md:py-14">
          <div className="container mx-auto px-4 max-w-4xl">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : elections.length === 0 ? (
              <div className="text-center py-20">
                <AlertCircle className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No Elections Available</h3>
                <p className="text-muted-foreground">Check back later for upcoming elections</p>
              </div>
            ) : (
              <>
                {/* Voter ID */}
                <Card className="mb-8">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Shield className="w-5 h-5 text-primary" />
                      <span className="font-bold text-sm">Verify Your Identity</span>
                    </div>
                    <Input
                      placeholder="Student email or phone number"
                      value={voterId}
                      onChange={(e) => setVoterId(e.target.value)}
                      className="mb-2"
                    />
                    <p className="text-xs text-muted-foreground">Used to ensure one vote per election. Kept private.</p>
                  </CardContent>
                </Card>

                {/* Elections */}
                <div className="space-y-8">
                  {elections.map((election) => {
                    const status = getStatus(election);
                    const positions = getPositions(election.id);
                    const totalVotes = getTotalVotes(election.id);
                    const isActive = status.label.includes("Active");
                    const hasEnded = status.label === "Ended";
                    const voted = hasVoted[election.id];

                    return (
                      <Card key={election.id} className="overflow-hidden">
                        <CardHeader className="border-b bg-muted/30">
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div>
                              <CardTitle className="text-xl md:text-2xl mb-1">{election.title}</CardTitle>
                              {election.description && (
                                <p className="text-sm text-muted-foreground">{election.description}</p>
                              )}
                            </div>
                            <Badge className={`${status.cls} border`}>{status.label}</Badge>
                          </div>
                          <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {format(new Date(election.start_date), "MMM d")} — {format(new Date(election.end_date), "MMM d, yyyy")}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              {totalVotes} votes
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="p-5 md:p-6">
                          {voted && (
                            <div className="mb-6 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg flex items-center gap-3 text-sm">
                              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                              <span className="text-green-800 dark:text-green-200 font-medium">
                                You have voted in this election
                              </span>
                            </div>
                          )}

                          {positions.map((position) => {
                            const posCandidates = getCandidates(election.id).filter(c => c.position === position);
                            const maxVotes = Math.max(...posCandidates.map(c => c.votes_count), 1);
                            return (
                              <div key={position} className="mb-8 last:mb-0">
                                <h3 className="text-base font-bold mb-4 pb-2 border-b">{position}</h3>
                                <div className="grid sm:grid-cols-2 gap-4">
                                  {posCandidates.map((candidate) => (
                                    <Card
                                      key={candidate.id}
                                      className={`p-4 transition-all cursor-pointer hover:shadow-md ${
                                        selectedCandidate === candidate.id ? "ring-2 ring-primary" : ""
                                      }`}
                                      onClick={() => isActive && !voted && setSelectedCandidate(candidate.id)}
                                    >
                                      <div className="flex items-start gap-3 mb-3">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                          {candidate.image_url ? (
                                            <img src={candidate.image_url} alt={candidate.name} className="w-full h-full object-cover" />
                                          ) : (
                                            <Users className="w-6 h-6 text-primary" />
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h4 className="font-bold">{candidate.name}</h4>
                                          {(hasEnded || voted) && (
                                            <span className="text-xs text-muted-foreground">{candidate.votes_count} votes</span>
                                          )}
                                        </div>
                                      </div>
                                      {candidate.manifesto && (
                                        <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{candidate.manifesto}</p>
                                      )}
                                      {(hasEnded || voted) && totalVotes > 0 && (
                                        <div className="mt-2">
                                          <div className="flex justify-between text-xs mb-1">
                                            <span className="text-muted-foreground">Results</span>
                                            <span className="font-medium">{Math.round((candidate.votes_count / totalVotes) * 100)}%</span>
                                          </div>
                                          <Progress value={(candidate.votes_count / maxVotes) * 100} className="h-2" />
                                        </div>
                                      )}
                                      {isActive && !voted && selectedCandidate === candidate.id && (
                                        <Button
                                          onClick={(e) => { e.stopPropagation(); handleVote(candidate.id, election.id); }}
                                          disabled={isVoting || !voterId.trim()}
                                          className="w-full mt-3 gap-2"
                                          size="sm"
                                        >
                                          {isVoting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Vote className="w-4 h-4" />}
                                          {isVoting ? "Voting..." : "Cast Vote"}
                                        </Button>
                                      )}
                                    </Card>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Elections;
