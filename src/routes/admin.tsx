import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/Header";
import { getDashboardStats, getMyAccess } from "@/lib/admin.functions";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => pageHead({ title: "Staff dashboard", description: "Bengal Studio staff dashboard.", path: "/admin", noindex: true }),
  component: Admin,
});

function Admin() {
  const [session, setSession] = useState<boolean | null>(null);
  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setSession(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);
  if (session === null) return null;
  if (!session) return <Login />;
  return <Dashboard />;
}

function Login() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [msg, setMsg] = useState<string | null>(null);
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email")), password = String(fd.get("password"));
    setMsg(null);
    const { error } = mode === "in"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin` } });
    if (error) setMsg(error.message);
    else if (mode === "up") setMsg("Check your email to confirm your account, then sign in.");
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface grid-paper px-4">
      <form onSubmit={onSubmit} className="card-tech w-full max-w-sm p-8 space-y-4">
        <Logo />
        <h1 className="text-headline-sm pt-2">Staff {mode === "in" ? "sign in" : "sign up"}</h1>
        <div><label className="field-label" htmlFor="email">Email</label><input id="email" name="email" type="email" required className="field" /></div>
        <div><label className="field-label" htmlFor="password">Password</label><input id="password" name="password" type="password" minLength={8} required className="field" /></div>
        {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
        <Button type="submit" className="w-full">{mode === "in" ? "Sign in" : "Create account"}</Button>
        <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="text-xs text-muted-foreground underline w-full">{mode === "in" ? "Need an account?" : "Already have an account?"}</button>
        <Link to="/" className="block text-xs text-center text-muted-foreground">← Back to site</Link>
      </form>
    </div>
  );
}

function Dashboard() {
  const access = useServerFn(getMyAccess);
  const stats = useServerFn(getDashboardStats);
  const me = useQuery({ queryKey: ["me"], queryFn: () => access() });
  const data = useQuery({ queryKey: ["dash"], queryFn: () => stats(), enabled: me.data?.isStaff === true });

  if (me.isLoading) return <p className="p-10 text-sm text-muted-foreground">Loading…</p>;
  if (!me.data?.isStaff) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card-tech max-w-md p-8 text-center">
          <h1 className="text-headline-sm">Account not yet authorised</h1>
          <p className="mt-2 text-sm text-muted-foreground">Your account exists but has no staff role. An administrator must grant it.</p>
          <Button variant="outline" className="mt-6" onClick={() => supabase.auth.signOut()}>Sign out</Button>
        </div>
      </div>
    );
  }
  const t = data.data?.totals;
  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-border bg-surface-lowest"><div className="container-site flex h-14 items-center justify-between"><Logo /><div className="flex items-center gap-3 text-sm"><Link to="/" className="text-muted-foreground">View site</Link><Button size="sm" variant="outline" onClick={() => supabase.auth.signOut()}>Sign out</Button></div></div></header>
      <main className="container-site py-10 space-y-10">
        <h1 className="text-headline-lg">Dashboard</h1>
        {data.isLoading && <p className="text-sm text-muted-foreground">Loading metrics…</p>}
        {data.error && <p className="text-sm text-destructive">{String(data.error)}</p>}
        {t && (
          <>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
              {[["Registrations", t.registrations], ["Early customers", t.earlyCustomers], ["Leads", t.leads], ["B2B inquiries", t.b2b], ["Subscribers", t.subscribers], ["Feedback", t.feedback], ["Page views (30d)", t.pageViews], ["CTA clicks (30d)", t.ctaClicks], ["Conversion rate", `${t.conversionRate}%`], ["Form abandonment", `${t.formAbandonRate}%`]].map(([l, v]) => (
                <div key={String(l)} className="card-tech p-5"><p className="text-label-xs text-muted-foreground">{l}</p><p className="font-display text-3xl font-semibold mt-1">{v}</p></div>
              ))}
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <List title="Product interest" rows={data.data!.productInterest} />
              <List title="Lead sources" rows={data.data!.leadSources} />
              <List title="Lead categories" rows={data.data!.leadCategories} />
              <List title="Devices" rows={data.data!.devices} />
              <List title="Countries" rows={data.data!.countries} />
              <List title="Feedback ratings" rows={data.data!.ratingDistribution} />
            </div>
            <div className="card-tech p-6">
              <p className="text-label-xs text-muted-foreground mb-4">Product performance</p>
              <table className="w-full text-sm"><thead className="text-label-xs text-muted-foreground text-left"><tr><th className="py-2">Product</th><th>Stage</th><th>Views</th><th>Interest</th><th>Feedback</th></tr></thead>
                <tbody>{data.data!.productPerf.map((p) => <tr key={p.name} className="border-t border-border"><td className="py-2 font-medium">{p.name}</td><td>{p.stage}</td><td>{p.views}</td><td>{p.interest}</td><td>{p.feedback}</td></tr>)}</tbody></table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function List({ title, rows }: { title: string; rows: { name: string; value: number }[] }) {
  return (
    <div className="card-tech p-6">
      <p className="text-label-xs text-muted-foreground mb-4">{title}</p>
      {rows.length === 0 ? <p className="text-sm text-muted-foreground">No data yet</p> : (
        <ul className="space-y-2 text-sm">{rows.slice(0, 8).map((r) => <li key={r.name} className="flex justify-between"><span>{r.name}</span><span className="font-medium">{r.value}</span></li>)}</ul>
      )}
    </div>
  );
}
