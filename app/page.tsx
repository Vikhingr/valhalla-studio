/**
 * app/page.tsx — Landing page pública de Valhalla Studio.
 *
 * Server Component que ensambla todas las secciones del sitio en orden:
 * Navbar → Hero → About → Projects → Services → Contact → Footer
 * más el botón flotante de WhatsApp.
 *
 * Cada sección es un componente independiente en /components/.
 * El formulario de Contact llama a POST /api/contact para enviar emails con Resend.
 */
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Services from "@/components/Services";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Projects />
        <Services />
        <Contact />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
