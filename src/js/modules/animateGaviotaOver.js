import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function animateGaviotaOver() {
  gsap.registerPlugin(ScrollTrigger);

  const wrapper = document.querySelector(".gaviota-over");
  const section = document.querySelector(".v-n-mth--17");
  const c1 = section?.querySelector(".v-n-mth__c--1");
  const c2 = section?.querySelector(".v-n-mth__c--2");

  if (!wrapper || !section || !c1 || !c2) return;

  ScrollTrigger.create({
    trigger: c1,
    start: "top top",
    endTrigger: c2,
    end: "bottom bottom",
    pin: wrapper,
    pinSpacing: false,
  });
}