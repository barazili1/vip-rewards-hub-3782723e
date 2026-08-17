import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  submitRegistration,
  verifyTelegramUser,
} from "@/lib/telegram.functions";
import { ADMIN_ID, grantAdmin } from "@/lib/session";
import {
  BadgeCheck,
  Check,
  Copy,
  Download,
  ImagePlus,
  Loader2,
  Send,
  Ticket,
  X,
  UserRound,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { TopBar } from "@/components/dark-vip/TopBar";
import heroImg from "@/assets/terms-hero.jpg";
import melbetLogo from "@/assets/melbet-logo.jpg";
import gameApple from "@/assets/game-apple.jpg";
import gameCrash from "@/assets/game-crash.jpg";
import stepTelegram from "@/assets/step-telegram.jpg";
import stepDeposit from "@/assets/step-deposit.jpg";
import stepId from "@/assets/step-id.jpg";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "شروط إنشاء الحساب — DARK VIP" },
      {
        name: "description",
        content:
          "أكمل خطوات إنشاء حساب DARK VIP: تحميل المنصة، الانضمام للقناة، البرومو كود، الإيداع، وإدخال الـ ID.",
      },
      { property: "og:title", content: "شروط إنشاء الحساب — DARK VIP" },
      {
        property: "og:description",
        content: "خمس خطوات بسيطة لتفعيل عضويتك في DARK VIP.",
      },
    ],
  }),
  component: TermsPage,
});

const PROMO = "B2BMEL";

function StepCard({
  image,
  badge,
  badgeTone = "gold",
  kicker,
  title,
  description,
  children,
}: {
  image: string;
  badge: string;
  badgeTone?: "gold" | "blue";
  kicker?: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <li className="animate-rise relative">
      <div className="surface-card relative overflow-hidden rounded-3xl p-5">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-primary/10 blur-3xl"
        />

        <div className="flex items-start gap-4">
          <div className="size-14 shrink-0 overflow-hidden rounded-2xl border border-border bg-secondary/40">
            <img
              src={image}
              alt=""
              loading="lazy"
              width={512}
              height={512}
              className="size-full object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={
                  badgeTone === "gold"
                    ? "rounded-full border border-primary/50 bg-primary/15 px-2.5 py-0.5 font-display text-[10px] font-bold tracking-[0.18em] text-primary"
                    : "rounded-full border border-sky-500/50 bg-sky-500/15 px-2.5 py-0.5 font-display text-[10px] font-bold tracking-[0.18em] text-sky-400"
                }
              >
                {badge}
              </span>
              <h2 className="font-display text-[16px] font-extrabold leading-snug text-foreground">
                {title}
              </h2>
            </div>
            {kicker ? (
              <p className="mt-1 font-display text-[11px] tracking-[0.3em] text-primary/80">
                {kicker}
              </p>
            ) : null}
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
        </div>

        {children ? <div className="mt-5">{children}</div> : null}
      </div>
    </li>
  );
}

function UploadBox({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const inputId = `upload-${label}`;
  return (
    <div className="relative">
      <input
        id={inputId}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => onChange(String(reader.result));
          reader.readAsDataURL(file);
        }}

      />
      <label
        htmlFor={inputId}
        className="flex h-24 cursor-pointer flex-col items-center justify-center gap-1.5 overflow-hidden rounded-[15px] border border-dashed border-border bg-secondary/25 text-center transition-colors hover:border-primary/60"
      >
        {value ? (
          <img src={value} alt={label} className="size-full object-cover" />
        ) : (
          <>
            <ImagePlus className="size-5 text-primary" />
            <span className="text-[11px] text-muted-foreground">{label}</span>
            <span className="font-display text-[9px] tracking-[0.2em] text-muted-foreground/70">
              UPLOAD
            </span>
          </>
        )}
      </label>
      {value ? (
        <button
          onClick={() => onChange(null)}
          aria-label={`حذف ${label}`}
          className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full border border-border bg-background/80 text-foreground"
        >
          <X className="size-3" />
        </button>
      ) : null}
    </div>
  );
}

function TermsPage() {
  const [copied, setCopied] = useState(false);
  const [depositShot, setDepositShot] = useState<string | null>(null);
  const [idShot, setIdShot] = useState<string | null>(null);
  const [userId, setUserId] = useState("");
  const [telegramUser, setTelegramUser] = useState("");
  const [dialog, setDialog] = useState<"closed" | "loading" | "done">("closed");
  const navigate = useNavigate();
  const sendToBot = useServerFn(submitRegistration);
  const checkTelegram = useServerFn(verifyTelegramUser);
  const idDigits = userId.replace(/\D/g, "");
  const idValid = idDigits.length >= 10 && idDigits.length <= 14;
  const handle = telegramUser.trim().replace(/^@/, "");
  const handleValid = /^[A-Za-z0-9_]{5,32}$/.test(handle);
  const ready = idValid && handleValid && !!depositShot && !!idShot;

  const handleSubmit = async () => {
    if (!idValid) {
      toast.error("الـ ID يجب أن يكون من 10 إلى 14 رقم");
      return;
    }
    if (!handleValid) {
      toast.error("يوزر التلجرام غير صحيح");
      return;
    }
    if (!depositShot || !idShot) {
      toast.error("الرجاء رفع صورة الإيداع وصورة الـ ID");
      return;
    }
    setDialog("loading");
    const started = Date.now();
    try {
      const check = await checkTelegram({ data: { username: handle } });
      if (!check.exists) {
        toast.error("يوزر التلجرام غير موجود، تأكد من الاسم");
        setDialog("closed");
        return;
      }
      await sendToBot({
        data: {
          userId: idDigits,
          telegramUser: `@${handle}`,
          depositShot,
          idShot,
        },
      });
    } catch (err) {
      console.error(err);
      toast.error("تعذّر إرسال البيانات، حاول مرة أخرى");
      setDialog("closed");
      return;
    }
    const wait = Math.max(0, 5000 - (Date.now() - started));
    window.setTimeout(() => setDialog("done"), wait);
  };



  const copyPromo = async () => {
    try {
      await navigator.clipboard.writeText(PROMO);
      setCopied(true);
      toast.success("تم نسخ البرومو كود");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("تعذّر النسخ، انسخ الكود يدويًا");
    }
  };

  return (
    <div className="min-h-screen">
      <TopBar backTo="/login" />

      <main className="mx-auto w-full max-w-xl pb-16">
        <section className="relative h-52 overflow-hidden">
          <img
            src={heroImg}
            alt="أجواء DARK VIP الذهبية"
            width={1536}
            height={768}
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
          <div className="absolute inset-x-0 bottom-0 px-5 pb-5 text-center">
            <p className="text-[10px] tracking-[0.45em] text-primary">
              ACCOUNT ACTIVATION
            </p>
            <h1 className="mt-2 font-display text-xl font-extrabold text-foreground">
              الرجاء إكمال الشروط التالية
            </h1>
            <p className="mt-2 text-xs text-muted-foreground">
              5 خطوات فقط لتفعيل عضويتك الحصرية
            </p>
          </div>
        </section>

        <div className="relative mt-6 px-5">
          <ol className="space-y-5">
            <StepCard
              image={melbetLogo}
              badge="OFFICIAL"
              kicker="MELBET APP"
              title="تحميل منصة MELBET"
              description="قم بتحميل التطبيق الرسمي لمنصة MELBET لأجهزة أندرويد أو آيفون."
            >
              <a
                href="https://refpa3665.com/L?tag=d_5703114m_70867c_&site=5703114&ad=70867"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-[15px] bg-foreground font-display text-sm font-bold text-background shadow-lg transition-transform active:scale-[0.98]"
              >
                <Download className="size-4" />
                تحميل التطبيق
              </a>
            </StepCard>

            <StepCard
              image={stepTelegram}
              badge="TELEGRAM"
              badgeTone="blue"
              title="الانضمام إلى قناة التلجرام"
              description="اشترك في القناة لمتابعة التحديثات واستلام كود التفعيل."
            >
              <a
                href="https://t.me/+MhA9HqqjqXYyMGY0"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gold flex h-12 w-full items-center justify-center gap-2 rounded-[15px] font-display text-sm font-bold text-primary-foreground transition-transform active:scale-[0.98]"
              >
                <Send className="size-4" />
                انضمام الآن
              </a>
            </StepCard>

            <StepCard
              image={melbetLogo}
              badge="PROMO"
              title="التسجيل بالبروموكود"
              description="انسخ البروموكود واستخدمه أثناء التسجيل لربط حسابك بالتطبيق."
            >
              <div className="flex h-[50px] w-full items-center gap-3 rounded-[15px] border border-dashed border-border bg-secondary/25 px-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
                  <Ticket className="size-3.5 text-foreground" />
                </span>
                <div className="flex min-w-0 flex-1 items-baseline gap-2">
                  <p className="font-display text-[9px] font-bold tracking-[0.25em] text-muted-foreground">
                    PROMOCODE
                  </p>
                  <p className="font-display text-sm font-extrabold tracking-[0.15em] text-foreground">
                    {PROMO}
                  </p>
                </div>
                <button
                  onClick={copyPromo}
                  aria-label="نسخ البرومو كود"
                  className="flex items-center gap-1.5 px-1 font-display text-[10px] font-bold tracking-[0.15em] text-muted-foreground transition-colors hover:text-primary"
                >
                  {copied ? "COPIED" : "COPY"}
                  {copied ? (
                    <Check className="size-3.5" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </button>
              </div>


              <a
                href="https://refpa3665.com/L?tag=d_5703114m_2170c_&site=5703114&ad=2170"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-[15px] bg-foreground font-display text-sm font-bold text-background shadow-lg transition-transform active:scale-[0.98]"
              >
                <UserRound className="size-4" />
                التسجيل في منصة MELBET
              </a>
            </StepCard>

            <StepCard
              image={stepDeposit}
              badge="DEPOSIT"
              title="إيداع التفعيل"
              description="الحد الأدنى للإيداع لتنشيط المحفظة (الأموال تبقى في رصيدك)."
            >
              <div className="grid grid-cols-2 gap-3">
                {[
                  { symbol: "$", value: "6.00", unit: "USD", note: "دولار" },
                  { symbol: "E£", value: "300", unit: "EGP", note: "جنيه" },
                ].map((item) => (
                  <div
                    key={item.unit}
                    className="relative overflow-hidden rounded-[15px] border border-primary/25 bg-gradient-to-b from-primary/10 to-transparent p-3 text-center"
                  >
                    <span className="mx-auto flex size-8 items-center justify-center rounded-full border border-primary/40 bg-primary/15 font-display text-xs font-extrabold text-primary">
                      {item.symbol}
                    </span>
                    <p className="mt-2 font-display text-2xl font-extrabold leading-none text-foreground">
                      {item.value}
                    </p>
                    <p className="mt-1.5 font-display text-[9px] font-bold tracking-[0.25em] text-primary/80">
                      {item.unit}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {item.note}
                    </p>
                  </div>
                ))}
              </div>
            </StepCard>

            <StepCard
              image={stepId}
              badge="VERIFY"
              title="إدخال الـ ID الخاص بك"
              description="أدخل رقم حسابك في MELBET وارفع صور التأكيد."
            >
              <div className="flex items-center gap-3 rounded-[15px] border border-input bg-secondary/40 px-4 focus-within:border-primary focus-within:ring-2 focus-within:ring-ring">
                <BadgeCheck className="size-4 text-primary" />
                <input
                  value={userId}
                  onChange={(e) => {
                    const value = e.target.value;
                    setUserId(value);
                    if (value.trim() === ADMIN_ID) {
                      grantAdmin();
                      toast.success("مرحبًا بك في لوحة التحكم");
                      void navigate({ to: "/admin" });
                    }
                  }}
                  placeholder="اكتب ID الحساب"
                  inputMode="numeric"
                  className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>

              <div className="mt-3 flex items-center gap-3 rounded-[15px] border border-input bg-secondary/40 px-4 focus-within:border-primary focus-within:ring-2 focus-within:ring-ring">
                <Send className="size-4 text-primary" />
                <input
                  value={telegramUser}
                  onChange={(e) => setTelegramUser(e.target.value)}
                  placeholder="ادخال يوزر التلجرام (@username)"
                  className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>



              <div className="mt-3 grid grid-cols-2 gap-3">
                <UploadBox
                  label="صورة الإيداع"
                  value={depositShot}
                  onChange={setDepositShot}
                />
                <UploadBox
                  label="صورة الـ ID"
                  value={idShot}
                  onChange={setIdShot}
                />
              </div>

              {ready ? (
                <div className="animate-rise mt-3 flex items-center justify-center gap-3">
                  <Link
                    to="/aviator"
                    className="group relative h-[100px] w-[150px] overflow-hidden rounded-[15px] border border-border transition-colors hover:border-primary/60"
                  >
                    <img
                      src={gameCrash}
                      alt="Aviator"
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                    <span className="absolute inset-x-0 bottom-1.5 text-center font-display text-[11px] font-bold text-foreground">
                      Aviator
                    </span>
                  </Link>
                  <Link
                    to="/apple"
                    className="group relative h-[100px] w-[150px] overflow-hidden rounded-[15px] border border-primary/50 transition-colors hover:border-primary"
                  >
                    <img
                      src={gameApple}
                      alt="Apple of fortune"
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                    <span className="absolute inset-x-0 bottom-1.5 text-center font-display text-[11px] font-bold text-primary">
                      Apple of fortune
                    </span>
                  </Link>
                </div>
              ) : null}
            </StepCard>

          </ol>
        </div>

        <div className="px-5">
          <button
            onClick={handleSubmit}
            className="mt-8 h-14 w-full rounded-[15px] bg-foreground font-display text-base font-extrabold text-background shadow-lg transition-transform active:scale-[0.98]"
          >
            إرسال وإكمال التسجيل
          </button>

          <p className="mt-5 text-center text-[11px] leading-relaxed text-muted-foreground">
            سيتم تفعيل عضويتك بعد التحقق من إكمال جميع الشروط.
          </p>
        </div>
      </main>

      {dialog !== "closed" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-6 backdrop-blur-md">
          <div className="surface-card animate-rise w-full max-w-sm overflow-hidden rounded-3xl p-7 text-center">
            {dialog === "loading" ? (
              <>
                <div className="relative mx-auto flex size-20 items-center justify-center">
                  <span className="absolute inset-0 rounded-full border border-primary/30" />
                  <Loader2 className="size-10 animate-spin text-primary" />
                </div>
                <p className="mt-6 font-display text-[10px] tracking-[0.4em] text-primary">
                  PROCESSING
                </p>
                <h3 className="mt-2 font-display text-lg font-extrabold text-foreground">
                  جاري إرسال بياناتك...
                </h3>
                <p className="mt-2 text-xs text-muted-foreground">
                  الرجاء الانتظار بينما نتحقق من الشروط
                </p>
                <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-secondary/50">
                  <div className="bg-gold h-full w-1/3 animate-[shine_1.4s_ease-in-out_infinite]" />
                </div>
              </>
            ) : (
              <>
                <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-primary/40 bg-primary/15">
                  <Check className="size-8 text-primary" />
                </div>
                <p className="mt-5 font-display text-[10px] tracking-[0.4em] text-primary">
                  VERIFIED
                </p>
                <h3 className="mt-2 font-display text-lg font-extrabold text-foreground">
                  تم إرسال طلبك بنجاح
                </h3>
                <p className="mt-4 text-[11px] text-muted-foreground">
                  تواصل مع الدعم لاستلام الكود
                </p>
                <p className="mt-1 font-display text-base font-extrabold text-foreground">
                  @B2BMEL
                </p>
                <a
                  href="https://t.me/B2BMEL"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 flex h-13 w-full items-center justify-center rounded-[15px] bg-foreground font-display text-sm font-extrabold text-background shadow-lg transition-transform active:scale-[0.98]"
                >
                  المتابعه لاخذ الكود
                </a>
                <button
                  onClick={() => setDialog("closed")}
                  className="mt-3 font-display text-[11px] tracking-[0.2em] text-muted-foreground"
                >
                  CLOSE
                </button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

