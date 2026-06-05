import { LogoMark } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <LogoMark className="h-8 w-8" />
            <div>
              <div className="font-heading font-extrabold tracking-wider text-sm">TRINETRA</div>
              <div className="text-[10px] text-muted-foreground">TECHNOLOGIES PVT. LTD.</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground italic">"Empowering Future Developers"</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Programs</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Full Stack</li><li>MERN Stack</li><li>AI & ML</li><li>Data Analytics</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>About</li><li>Founder</li><li>Mission</li><li>Contact</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Founder</h4>
          <p className="text-sm text-muted-foreground">Prajwal Karajange<br/>Founder & CEO</p>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Trinetra Technologies Pvt. Ltd. All rights reserved.
      </div>
    </footer>
  );
}
