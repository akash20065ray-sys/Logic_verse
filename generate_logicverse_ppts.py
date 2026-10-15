"""
LogicVerse Presentation Generator (Crimson Orbit Theme - Perfected Proportions & Typography)
Generates 2 widescreen (16:9) presentations:
1. LogicVerse_Presentation_With_Names.pptx (With team names: Akash, Krishna, Sanskar, Ghansham, Hari)
2. LogicVerse_Presentation_Without_Names.pptx (Anonymous / Role-based)

Design Highlights:
- Exact Crimson Orbit color palette:
    Dark Slate #0F1219, Navy Cards #191E2A & #202636,
    Crimson #EB3C3C, Amber Gold #F59E0B, Sky Cyan #38BDF8,
    Emerald Green #10B981, Royal Purple #A855F7.
- Modern subtle rounded corners (shape adjustment 0.04 - sleek 12px style).
- Explicit vertical anchor (MSO_ANCHOR.TOP) and left alignment across all cards.
- Bug-free bullet insertion: headers and bullets are strictly separated.
- Generous presentation typography: 13.5pt-14pt card titles, 10.5pt subtitles, 11.5pt-12pt bold leads, 10.5pt-11pt body text.
- Balanced vertical distribution with bottom highlight tags eliminating empty voids.
- Modules 6 & 7 (CFG, PDA & Turing Machine) strictly set as Future Scope (Slide 12).
- Zero text overflow, no awkward voids or misaligned paragraphs.
"""

import os
import shutil
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE


def build_presentation(with_names: bool, filename: str):
    prs = Presentation()
    prs.slide_width = Inches(13.333)  # 16:9 Widescreen
    prs.slide_height = Inches(7.5)

    # -------------------------------------------------------------------------
    # Color Palette (Crimson Orbit Exact Specs)
    # -------------------------------------------------------------------------
    BG_DARK        = RGBColor(15, 18, 25)     # #0F1219 Deep Canvas
    BG_CARD        = RGBColor(25, 30, 42)     # #191E2A Primary Card Navy
    BG_CARD_LIGHT  = RGBColor(32, 38, 54)     # #202636 Secondary Card Navy
    
    BORDER_CRIMSON = RGBColor(235, 60, 60)    # #EB3C3C Crimson Accent
    BORDER_GOLD    = RGBColor(245, 158, 11)   # #F59E0B Amber Gold Accent
    BORDER_CYAN    = RGBColor(56, 189, 248)   # #38BDF8 Sky Cyan Accent
    BORDER_GREEN   = RGBColor(16, 185, 129)   # #10B981 Emerald Green Accent
    BORDER_PURPLE  = RGBColor(168, 85, 247)   # #A855F7 Purple Accent
    
    TEXT_WHITE     = RGBColor(255, 255, 255)  # Pure White Headers
    TEXT_MUTED     = RGBColor(203, 213, 225)  # #CBD5E1 Secondary Muted Text
    TEXT_GOLD      = RGBColor(252, 211, 77)   # #FCD34D Soft Gold
    TEXT_CYAN      = RGBColor(186, 230, 253)  # Soft Cyan
    TEXT_CRIMSON   = RGBColor(254, 202, 202)  # Soft Crimson
    TEXT_GREEN     = RGBColor(167, 243, 208)  # Soft Green
    TEXT_PURPLE    = RGBColor(233, 213, 255)  # Soft Purple

    blank_layout = prs.slide_layouts[6]

    # Helper: Slide Background
    def add_bg(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_DARK
        bg.line.fill.background()
        return bg

    # Helper: Slide Header with Category Tag and Underline Bar
    def add_header(slide, title_text, category_text="LOGICVERSE • VISUAL COMPUTER SCIENCE IDE"):
        tb_cat = slide.shapes.add_textbox(Inches(0.8), Inches(0.35), Inches(11.73), Inches(0.3))
        tf_cat = tb_cat.text_frame
        tf_cat.word_wrap = True
        tf_cat.vertical_anchor = MSO_ANCHOR.TOP
        tf_cat.margin_left = tf_cat.margin_right = tf_cat.margin_top = tf_cat.margin_bottom = 0
        p_cat = tf_cat.paragraphs[0]
        p_cat.alignment = PP_ALIGN.LEFT
        p_cat.text = category_text.upper()
        p_cat.font.name = "Arial"
        p_cat.font.size = Pt(10)
        p_cat.font.bold = True
        p_cat.font.color.rgb = BORDER_CRIMSON

        tb_title = slide.shapes.add_textbox(Inches(0.8), Inches(0.65), Inches(11.73), Inches(0.65))
        tf_title = tb_title.text_frame
        tf_title.word_wrap = True
        tf_title.vertical_anchor = MSO_ANCHOR.TOP
        tf_title.margin_left = tf_title.margin_right = tf_title.margin_top = tf_title.margin_bottom = 0
        p_title = tf_title.paragraphs[0]
        p_title.alignment = PP_ALIGN.LEFT
        p_title.text = title_text
        p_title.font.name = "Arial"
        p_title.font.size = Pt(22)
        p_title.font.bold = True
        p_title.font.color.rgb = TEXT_WHITE

        bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.35), Inches(11.73), Inches(0.035))
        bar.fill.solid()
        bar.fill.fore_color.rgb = BORDER_CRIMSON
        bar.line.fill.background()

    # Helper: Create Base Rounded Card with Modern Sleek Corners
    def add_card_box(slide, left, top, width, height, border_color=BORDER_CRIMSON, bg_color=BG_CARD, corner_radius=0.04):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        card.line.color.rgb = border_color
        card.line.width = Pt(1.75)
        try:
            card.adjustments[0] = corner_radius
        except Exception:
            pass
        
        tf = card.text_frame
        tf.word_wrap = True
        tf.vertical_anchor = MSO_ANCHOR.TOP
        tf.margin_left = Inches(0.28)
        tf.margin_right = Inches(0.28)
        tf.margin_top = Inches(0.25)
        tf.margin_bottom = Inches(0.2)
        return card

    # Helper: Always append new bullet paragraphs to prevent overwriting headers
    def append_bullets(tf, items, title_color=BORDER_GOLD, title_font_size=12, desc_font_size=11, spacing=10):
        for head, desc in items:
            p = tf.add_paragraph()
            p.alignment = PP_ALIGN.LEFT
            p.space_before = Pt(spacing)
            p.space_after = Pt(1)
            
            run_title = p.add_run()
            run_title.text = f"• {head}: "
            run_title.font.name = "Calibri"
            run_title.font.size = Pt(title_font_size)
            run_title.font.bold = True
            run_title.font.color.rgb = title_color

            run_desc = p.add_run()
            run_desc.text = desc
            run_desc.font.name = "Calibri"
            run_desc.font.size = Pt(desc_font_size)
            run_desc.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 1: TITLE SLIDE
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    add_bg(s1)

    # Crimson Vertical Left Accent Line
    accent_bar = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.15), Inches(0.12), Inches(3.2))
    accent_bar.fill.solid()
    accent_bar.fill.fore_color.rgb = BORDER_CRIMSON
    accent_bar.line.fill.background()

    # Title & Subtitle Box
    tb_main = s1.shapes.add_textbox(Inches(1.15), Inches(1.05), Inches(11.38), Inches(3.3))
    tf_main = tb_main.text_frame
    tf_main.word_wrap = True
    tf_main.vertical_anchor = MSO_ANCHOR.TOP
    tf_main.margin_left = tf_main.margin_top = tf_main.margin_right = tf_main.margin_bottom = 0

    p_tag = tf_main.paragraphs[0]
    p_tag.alignment = PP_ALIGN.LEFT
    p_tag.text = "DISCRETE MATHEMATICS & AUTOMATA THEORY • CAPSTONE PRESENTATION"
    p_tag.font.name = "Arial"
    p_tag.font.size = Pt(11)
    p_tag.font.bold = True
    p_tag.font.color.rgb = BORDER_GOLD

    p_h1 = tf_main.add_paragraph()
    p_h1.alignment = PP_ALIGN.LEFT
    p_h1.text = "LogicVerse: An Interactive Visual IDE\nfor Discrete Math & Automata Theory"
    p_h1.font.name = "Arial"
    p_h1.font.size = Pt(30)
    p_h1.font.bold = True
    p_h1.font.color.rgb = TEXT_WHITE
    p_h1.space_before = Pt(8)

    p_sub = tf_main.add_paragraph()
    p_sub.alignment = PP_ALIGN.LEFT
    p_sub.text = "Build mathematical graphs on a canvas, simulate algorithms step-by-step, observe dynamic Venn diagrams, and receive live pedagogical guidance from LogicAI."
    p_sub.font.name = "Calibri"
    p_sub.font.size = Pt(13.5)
    p_sub.font.color.rgb = TEXT_MUTED
    p_sub.space_before = Pt(10)

    # Bottom Team Information Card
    card_info = add_card_box(s1, Inches(0.8), Inches(4.7), Inches(11.73), Inches(2.3), border_color=BORDER_CRIMSON)
    tf_info = card_info.text_frame

    p_ih = tf_info.paragraphs[0]
    p_ih.alignment = PP_ALIGN.LEFT
    p_ih.text = "PROJECT ROLES & CONTRIBUTORS" if with_names else "PROJECT DOMAINS & PLATFORM ARCHITECTURE"
    p_ih.font.name = "Arial"
    p_ih.font.size = Pt(13)
    p_ih.font.bold = True
    p_ih.font.color.rgb = TEXT_GOLD

    if with_names:
        roles = [
            ("Akash (Lead)", "Finite Automata (DFA/NFA Simulator, NFA->DFA, Minimization) + LogicAI Chatbot + Canvas IDE"),
            ("Sanskar & Ghansham", "Set Theory Engine, Interactive Venn Diagrams, Propositional Logic Gates & Truth Tables"),
            ("Hari & Krishna", "Mathematical Proof Solvers (PIE, Cantor, Induction) + Binary Relations & Warshall's Algorithm"),
        ]
        for leader, area in roles:
            p = tf_info.add_paragraph()
            p.alignment = PP_ALIGN.LEFT
            p.space_before = Pt(7)
            r1 = p.add_run()
            r1.text = f"• {leader}: "
            r1.font.name = "Calibri"
            r1.font.size = Pt(11.5)
            r1.font.bold = True
            r1.font.color.rgb = TEXT_WHITE
            r2 = p.add_run()
            r2.text = area
            r2.font.name = "Calibri"
            r2.font.size = Pt(11)
            r2.font.color.rgb = TEXT_MUTED
    else:
        info_bullets = [
            ("Core Focus", "Set Theory, Propositional Logic, Proof Solvers, Relations & Functions, and Finite Automata (DFA/NFA)"),
            ("Key Innovations", "Interactive drag-and-drop canvas, live step-by-step glowing simulation, and context-aware AI tutor"),
            ("Engineering", "Next.js 16, React Flow, Zustand, TypeScript, and Google Gemini LLM with 51 passing automated unit tests"),
        ]
        for label, val in info_bullets:
            p = tf_info.add_paragraph()
            p.alignment = PP_ALIGN.LEFT
            p.space_before = Pt(7)
            r1 = p.add_run()
            r1.text = f"• {label}: "
            r1.font.name = "Calibri"
            r1.font.size = Pt(11.5)
            r1.font.bold = True
            r1.font.color.rgb = TEXT_WHITE
            r2 = p.add_run()
            r2.text = val
            r2.font.name = "Calibri"
            r2.font.size = Pt(11)
            r2.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 2: PROBLEM STATEMENT & SOLUTION
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    add_bg(s2)
    add_header(s2, "The Challenge in Learning Math & Our Visual Solution", "PROBLEM STATEMENT & SOLUTION")

    # Left: Problem Card
    c_prob = add_card_box(s2, Inches(0.8), Inches(1.65), Inches(5.7), Inches(5.35), border_color=BORDER_CRIMSON)
    tf_p = c_prob.text_frame

    p_phead = tf_p.paragraphs[0]
    p_phead.alignment = PP_ALIGN.LEFT
    p_phead.text = "THE PROBLEM: INVISIBLE & ABSTRACT THEORY"
    p_phead.font.name = "Arial"
    p_phead.font.size = Pt(14)
    p_phead.font.bold = True
    p_phead.font.color.rgb = BORDER_CRIMSON

    p_psub = tf_p.add_paragraph()
    p_psub.alignment = PP_ALIGN.LEFT
    p_psub.text = "Traditional Textbook Pedagogical Limitations"
    p_psub.font.name = "Calibri"
    p_psub.font.size = Pt(10.5)
    p_psub.font.bold = True
    p_psub.font.color.rgb = TEXT_GOLD
    p_psub.space_before = Pt(2)

    prob_items = [
        ("Static Equations", "Students only read static formulas on paper with no interactive way to test variations."),
        ("Invisible State Changes", "Tracing automata transitions (q0 -> q1) or matrix closures by hand leads to frequent mistakes."),
        ("No Step-by-Step Guidance", "Textbooks provide final answers without explaining the intermediate logical deductions."),
        ("Disconnected Tools", "Venn diagrams, truth tables, and state diagrams are taught in fragmented, single-purpose apps."),
        ("High Cognitive Barrier", "Abstract mathematical formalism discourages beginners and makes debugging proofs difficult."),
    ]
    append_bullets(tf_p, prob_items, title_color=TEXT_CRIMSON, title_font_size=12, desc_font_size=11, spacing=10)

    p_pfoot = tf_p.add_paragraph()
    p_pfoot.alignment = PP_ALIGN.LEFT
    p_pfoot.text = "Impact: Causes high confusion, lost marks, and cognitive fatigue."
    p_pfoot.font.name = "Calibri"
    p_pfoot.font.size = Pt(10)
    p_pfoot.font.bold = True
    p_pfoot.font.color.rgb = TEXT_CRIMSON
    p_pfoot.space_before = Pt(14)

    # Right: Solution Card
    c_sol = add_card_box(s2, Inches(6.83), Inches(1.65), Inches(5.7), Inches(5.35), border_color=BORDER_CYAN)
    tf_s = c_sol.text_frame

    p_shead = tf_s.paragraphs[0]
    p_shead.alignment = PP_ALIGN.LEFT
    p_shead.text = "OUR SOLUTION: THE LOGICVERSE VISUAL IDE"
    p_shead.font.name = "Arial"
    p_shead.font.size = Pt(14)
    p_shead.font.bold = True
    p_shead.font.color.rgb = BORDER_CYAN

    p_ssub = tf_s.add_paragraph()
    p_ssub.alignment = PP_ALIGN.LEFT
    p_ssub.text = "Unified Interactive Computer Science Laboratory"
    p_ssub.font.name = "Calibri"
    p_ssub.font.size = Pt(10.5)
    p_ssub.font.bold = True
    p_ssub.font.color.rgb = TEXT_GOLD
    p_ssub.space_before = Pt(2)

    sol_items = [
        ("Visual Graph Canvas", "Build mathematical sets, logic gates, and state machines like modular building blocks."),
        ("Live Glowing Simulation", "Watch states and arrows light up step-by-step in real time as test strings are processed."),
        ("Instant Formal Math", "Every visual graph automatically outputs Venn diagrams, truth tables, and LaTeX equations."),
        ("Context-Aware LogicAI", "An embedded AI tutor that sees your canvas, explains each step, and diagnoses mistakes."),
        ("Automated Test Suites", "Run multiple test cases with green accepted and red rejected tags plus step counter logs."),
    ]
    append_bullets(tf_s, sol_items, title_color=TEXT_CYAN, title_font_size=12, desc_font_size=11, spacing=10)

    p_sfoot = tf_s.add_paragraph()
    p_sfoot.alignment = PP_ALIGN.LEFT
    p_sfoot.text = "Outcome: 100% interactive, visual, and beginner-friendly learning."
    p_sfoot.font.name = "Calibri"
    p_sfoot.font.size = Pt(10)
    p_sfoot.font.bold = True
    p_sfoot.font.color.rgb = TEXT_CYAN
    p_sfoot.space_before = Pt(14)

    # =========================================================================
    # SLIDE 3: SYSTEM ARCHITECTURE & DATA FLOW (5 Columns, Filled Richly)
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    add_bg(s3)
    add_header(s3, "System Architecture: End-to-End Mathematical Pipeline", "SYSTEM ARCHITECTURE")

    arch_stages = [
        ("STAGE 01", "Visual Canvas", "React Flow DAG", "User Mouse & Drag", "Visual Graph DAG", [
            ("Custom SVG Nodes", "Circular states, double rings, and gate shapes."),
            ("Animated Bezier Edges", "Curved transition arrows with symbol labels."),
            ("Canvas Viewport", "Smooth panning, zooming, and snap-to-grid."),
        ], "React Flow 11", BORDER_CYAN),
        ("STAGE 02", "Graph Parser", "Zustand Store", "Canvas Nodes & Edges", "Mathematical AST", [
            ("AST Generation", "Parses visual connections into formal models."),
            ("State Isolation", "Zero re-render latency across dock panels."),
            ("Schema Validation", "Strict TypeScript runtime verification."),
        ], "Zustand v5 Store", BORDER_GOLD),
        ("STAGE 03", "Math Engines", "Core Solvers", "Mathematical AST", "Exact Solution Data", [
            ("Automata Solver", "Hopcroft minimization & NFA subset construction."),
            ("Matrix Engine", "Warshall's transitive closure derivation in O(n³)."),
            ("Logic Solver", "Full truth tables & canonical DNF/CNF synthesis."),
        ], "Core Algorithms", BORDER_CRIMSON),
        ("STAGE 04", "Output Dock", "Visual Panels", "Computed Data Models", "Interactive UI Views", [
            ("Dynamic SVG Venn", "2-set & 3-set interactive spatial regions."),
            ("Live Step Stepper", "Animated glowing states and pulsing edges."),
            ("Batch Test Suite", "Instant green accepted and red rejected tags."),
        ], "SVG Path & Lucide", BORDER_GREEN),
        ("STAGE 05", "LogicAI Tutor", "Hybrid AI Engine", "Canvas State + Prompt", "Socratic Guidance", [
            ("Canvas Perception", "Reads live nodes directly from store."),
            ("Live LLM API", "Streams explanations via Gemini or Groq."),
            ("Offline Fallback", "Deterministic AST rules when offline."),
        ], "Gemini 2.5 Flash", BORDER_PURPLE),
    ]

    card_w = Inches(2.2)
    gap = Inches(0.183)
    for i, (stage_tag, title, sub, d_in, d_out, bullets, tech_tag, col) in enumerate(arch_stages):
        c_left = Inches(0.8 + i * (2.2 + 0.183))
        c = add_card_box(s3, c_left, Inches(1.65), card_w, Inches(5.35), border_color=col)
        tf = c.text_frame
        tf.margin_left = tf.margin_right = Inches(0.16)
        tf.margin_top = Inches(0.2)
        tf.margin_bottom = Inches(0.15)

        # Stage Tag
        p_tag = tf.paragraphs[0]
        p_tag.alignment = PP_ALIGN.LEFT
        p_tag.text = stage_tag
        p_tag.font.name = "Arial"
        p_tag.font.size = Pt(9.5)
        p_tag.font.bold = True
        p_tag.font.color.rgb = col

        # Title
        p_t = tf.add_paragraph()
        p_t.alignment = PP_ALIGN.LEFT
        p_t.text = title
        p_t.font.name = "Arial"
        p_t.font.size = Pt(12.5)
        p_t.font.bold = True
        p_t.font.color.rgb = TEXT_WHITE
        p_t.space_before = Pt(2)

        # Subtitle / Tech
        p_s = tf.add_paragraph()
        p_s.alignment = PP_ALIGN.LEFT
        p_s.text = sub
        p_s.font.name = "Calibri"
        p_s.font.size = Pt(10)
        p_s.font.bold = True
        p_s.font.color.rgb = TEXT_GOLD
        p_s.space_before = Pt(2)

        # Data Flow Box
        p_flow = tf.add_paragraph()
        p_flow.alignment = PP_ALIGN.LEFT
        p_flow.text = f"In: {d_in}\nOut: {d_out}"
        p_flow.font.name = "Calibri"
        p_flow.font.size = Pt(8.5)
        p_flow.font.color.rgb = TEXT_CYAN
        p_flow.space_before = Pt(6)

        # Divider label
        p_div = tf.add_paragraph()
        p_div.alignment = PP_ALIGN.LEFT
        p_div.text = "KEY CAPABILITIES"
        p_div.font.name = "Arial"
        p_div.font.size = Pt(8.5)
        p_div.font.bold = True
        p_div.font.color.rgb = col
        p_div.space_before = Pt(6)

        # 3 Structured Bullets
        for b_head, b_desc in bullets:
            pb = tf.add_paragraph()
            pb.alignment = PP_ALIGN.LEFT
            pb.space_before = Pt(5)
            r1 = pb.add_run()
            r1.text = f"• {b_head}: "
            r1.font.name = "Calibri"
            r1.font.size = Pt(9.5)
            r1.font.bold = True
            r1.font.color.rgb = TEXT_WHITE
            r2 = pb.add_run()
            r2.text = b_desc
            r2.font.name = "Calibri"
            r2.font.size = Pt(9)
            r2.font.color.rgb = TEXT_MUTED

        # Bottom Tech & Status Tag
        p_st = tf.add_paragraph()
        p_st.alignment = PP_ALIGN.LEFT
        p_st.space_before = Pt(10)
        p_st.text = f"Tech: {tech_tag}\nStatus: ✓ 100% Operational"
        p_st.font.name = "Calibri"
        p_st.font.size = Pt(8.5)
        p_st.font.bold = True
        p_st.font.color.rgb = TEXT_GREEN

    # =========================================================================
    # SLIDE 4: TECHNOLOGY STACK (6 Structured Cards)
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    add_bg(s4)
    add_header(s4, "Modern Tech Stack Built for Real-Time Performance", "TECHNOLOGY CHOICES")

    tech_cards = [
        ("Next.js 16 & React 19", "Modern Web Framework", [
            ("App Router", "High-performance server & client components."),
            ("Zero Latency", "Instant page loads with no client lag."),
            ("Production Ready", "Modular architecture deployed on Vercel."),
        ], "Role: Core Web Shell & API Hosting", BORDER_CYAN),
        ("React Flow Canvas", "Graph Visualization Engine", [
            ("Custom SVG Nodes", "Circular states, double rings, and gate shapes."),
            ("Interactive Edges", "Animated bezier lines with symbol labels."),
            ("Viewport Controls", "Smooth zooming, panning, and mini-map."),
        ], "Role: Interactive Graph Workspace", BORDER_GOLD),
        ("Zustand State Store", "Centralized State Manager", [
            ("Single Source of Truth", "Synchronizes canvas nodes and dock panels."),
            ("Instant Recompute", "Graph changes update tables immediately."),
            ("Lightweight", "Zero boilerplate with extreme speed."),
        ], "Role: Real-Time Global State Flow", BORDER_GREEN),
        ("TypeScript & Vitest", "Type Safety & Testing Suite", [
            ("Strict Types", "End-to-end typing across all math formulas."),
            ("51 Unit Tests", "100% pass rate across 9 comprehensive suites."),
            ("Algorithm Assurance", "Guarantees formal correctness of all solvers."),
        ], "Role: Algorithmic Verification", BORDER_CRIMSON),
        ("Google Gemini & LLMs", "AI Reasoning Backend", [
            ("Live Context Injection", "Sends current canvas graph state with prompts."),
            ("Custom API Keys", "Supports Gemini, Groq, and OpenAI via UI settings."),
            ("Offline Resilience", "Seamless fallback to local AST rules."),
        ], "Role: Context-Aware Mathematical Tutor", BORDER_PURPLE),
        ("Tailwind CSS", "Design System & Theme", [
            ("Crimson Orbit", "High-contrast dark mode with neon accents."),
            ("Glassmorphism", "Translucent floating docks and toolbars."),
            ("Micro-Animations", "Glowing state transitions and pulse rings."),
        ], "Role: Premium Visual Aesthetics", BORDER_CYAN),
    ]

    for i, (title, sub, bullets, role_tag, col) in enumerate(tech_cards):
        col_idx = i % 3
        row_idx = i // 3
        c_left = Inches(0.8 + col_idx * 4.0)
        c_top = Inches(1.65 + row_idx * 2.75)
        c = add_card_box(s4, c_left, c_top, Inches(3.73), Inches(2.55), border_color=col)
        tf = c.text_frame
        tf.margin_left = tf.margin_right = Inches(0.22)
        tf.margin_top = Inches(0.18)
        tf.margin_bottom = Inches(0.15)

        p1 = tf.paragraphs[0]
        p1.alignment = PP_ALIGN.LEFT
        p1.text = title
        p1.font.name = "Arial"
        p1.font.size = Pt(12.5)
        p1.font.bold = True
        p1.font.color.rgb = col

        p2 = tf.add_paragraph()
        p2.alignment = PP_ALIGN.LEFT
        p2.text = sub
        p2.font.name = "Calibri"
        p2.font.size = Pt(10)
        p2.font.bold = True
        p2.font.color.rgb = TEXT_GOLD
        p2.space_before = Pt(2)

        for b_head, b_desc in bullets:
            pb = tf.add_paragraph()
            pb.alignment = PP_ALIGN.LEFT
            pb.space_before = Pt(5)
            r1 = pb.add_run()
            r1.text = f"• {b_head}: "
            r1.font.name = "Calibri"
            r1.font.size = Pt(9.5)
            r1.font.bold = True
            r1.font.color.rgb = TEXT_WHITE
            r2 = pb.add_run()
            r2.text = b_desc
            r2.font.name = "Calibri"
            r2.font.size = Pt(9)
            r2.font.color.rgb = TEXT_MUTED

        p_rf = tf.add_paragraph()
        p_rf.alignment = PP_ALIGN.LEFT
        p_rf.text = role_tag
        p_rf.font.name = "Calibri"
        p_rf.font.size = Pt(8.5)
        p_rf.font.bold = True
        p_rf.font.color.rgb = col
        p_rf.space_before = Pt(8)

    # =========================================================================
    # SLIDE 5: MODULE 1 — SET THEORY & VENN DIAGRAMS
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    add_bg(s5)
    owner_sub = " (Sanskar's Contribution)" if with_names else ""
    add_header(s5, f"Module 1: Set Theory & Dynamic Venn Diagrams{owner_sub}", "CORE DOMAIN 1 • SET THEORY")

    c1 = add_card_box(s5, Inches(0.8), Inches(1.65), Inches(5.7), Inches(5.35), border_color=BORDER_CYAN)
    tf1 = c1.text_frame

    p1_h = tf1.paragraphs[0]
    p1_h.alignment = PP_ALIGN.LEFT
    p1_h.text = "SET OPERATIONS & EXPRESSION ENGINE"
    p1_h.font.name = "Arial"
    p1_h.font.size = Pt(14)
    p1_h.font.bold = True
    p1_h.font.color.rgb = BORDER_CYAN

    p1_sub = tf1.add_paragraph()
    p1_sub.alignment = PP_ALIGN.LEFT
    p1_sub.text = "Set Builder, Boolean Algebra & Power Sets"
    p1_sub.font.name = "Calibri"
    p1_sub.font.size = Pt(10.5)
    p1_sub.font.bold = True
    p1_sub.font.color.rgb = TEXT_GOLD
    p1_sub.space_before = Pt(2)

    items_s1 = [
        ("Visual Set Builder", "Create sets like A = {1, 2, 3} and B = {3, 4, 5} with customized color accents."),
        ("Fundamental Operations", "Compute Union (A ∪ B), Intersection (A ∩ B), and Difference (A - B) in real time."),
        ("Advanced Operations", "Compute Symmetric Difference (A ⊕ B), Cartesian Product (A × B), and Power Set P(A)."),
        ("Expression Evaluator", "Parse complex multi-set algebraic formulas with nested brackets and parentheses."),
        ("Live Cardinality Output", "Instantly observe set size |A ∪ B| calculations and automatic duplicate elimination."),
    ]
    append_bullets(tf1, items_s1, title_color=TEXT_CYAN, title_font_size=12, desc_font_size=11, spacing=10)

    p1_foot = tf1.add_paragraph()
    p1_foot.alignment = PP_ALIGN.LEFT
    p1_foot.text = "Coverage: Complete Boolean Set Algebra, Laws & Power Sets"
    p1_foot.font.name = "Calibri"
    p1_foot.font.size = Pt(10)
    p1_foot.font.bold = True
    p1_foot.font.color.rgb = TEXT_CYAN
    p1_foot.space_before = Pt(14)

    c2 = add_card_box(s5, Inches(6.83), Inches(1.65), Inches(5.7), Inches(5.35), border_color=BORDER_GOLD)
    tf2 = c2.text_frame

    p2_h = tf2.paragraphs[0]
    p2_h.alignment = PP_ALIGN.LEFT
    p2_h.text = "DYNAMIC SVG VENN DIAGRAMS"
    p2_h.font.name = "Arial"
    p2_h.font.size = Pt(14)
    p2_h.font.bold = True
    p2_h.font.color.rgb = BORDER_GOLD

    p2_sub = tf2.add_paragraph()
    p2_sub.alignment = PP_ALIGN.LEFT
    p2_sub.text = "2-Set & 3-Set Spatial Partitioning Engine"
    p2_sub.font.name = "Calibri"
    p2_sub.font.size = Pt(10.5)
    p2_sub.font.bold = True
    p2_sub.font.color.rgb = TEXT_GOLD
    p2_sub.space_before = Pt(2)

    items_s2 = [
        ("2-Set & 3-Set Support", "Switch seamlessly between dual-circle and triple-circle mathematical Venn diagrams."),
        ("8-Region Partitioning", "Elements are automatically sorted into their exact mathematical intersection zones."),
        ("Active Region Glow", "The region matching your active operation lights up with a colorful visual glow."),
        ("Dual Notation Views", "Inspect results in formal mathematical set-roster notation alongside visual diagrams."),
        ("Real-Time Reactivity", "Modifying set elements or dragging nodes instantly re-partitions Venn regions."),
    ]
    append_bullets(tf2, items_s2, title_color=TEXT_GOLD, title_font_size=12, desc_font_size=11, spacing=10)

    p2_foot = tf2.add_paragraph()
    p2_foot.alignment = PP_ALIGN.LEFT
    p2_foot.text = "Engine: Pure SVG Math Partitioning with Zero Client Lag"
    p2_foot.font.name = "Calibri"
    p2_foot.font.size = Pt(10)
    p2_foot.font.bold = True
    p2_foot.font.color.rgb = TEXT_GOLD
    p2_foot.space_before = Pt(14)

    # =========================================================================
    # SLIDE 6: MODULE 2 — PROPOSITIONAL LOGIC & TRUTH TABLES
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    add_bg(s6)
    owner_sub = " (Ghansham's Contribution)" if with_names else ""
    add_header(s6, f"Module 2: Propositional Logic & Truth Tables{owner_sub}", "CORE DOMAIN 2 • FORMAL LOGIC")

    c1 = add_card_box(s6, Inches(0.8), Inches(1.65), Inches(5.7), Inches(5.35), border_color=BORDER_PURPLE)
    tf1 = c1.text_frame

    p1_h = tf1.paragraphs[0]
    p1_h.alignment = PP_ALIGN.LEFT
    p1_h.text = "LOGIC GATES CANVAS & AST ENGINE"
    p1_h.font.name = "Arial"
    p1_h.font.size = Pt(14)
    p1_h.font.bold = True
    p1_h.font.color.rgb = BORDER_PURPLE

    p1_sub = tf1.add_paragraph()
    p1_sub.alignment = PP_ALIGN.LEFT
    p1_sub.text = "Boolean DAG Signal Propagation & WFF Builder"
    p1_sub.font.name = "Calibri"
    p1_sub.font.size = Pt(10.5)
    p1_sub.font.bold = True
    p1_sub.font.color.rgb = TEXT_GOLD
    p1_sub.space_before = Pt(2)

    items_l1 = [
        ("Proposition Variables", "Place boolean inputs (P, Q, R, S) with simple True / False clickable toggle buttons."),
        ("Complete Operator Library", "Connect variables through AND (∧), OR (∨), NOT (¬), IMPLIES (→), and IFF (↔)."),
        ("Live Signal Propagation", "Toggle any input and watch True/False signals travel through the DAG immediately."),
        ("Formula Synthesizer", "Automatically generates canonical mathematical Well-Formed Formulas (WFF)."),
        ("Interactive Truth Probes", "Hover over intermediate wires to inspect local sub-formula evaluations."),
    ]
    append_bullets(tf1, items_l1, title_color=TEXT_PURPLE, title_font_size=12, desc_font_size=11, spacing=10)

    p1_foot = tf1.add_paragraph()
    p1_foot.alignment = PP_ALIGN.LEFT
    p1_foot.text = "Syntax: Well-Formed Formulas (WFF) with Real-Time AST Validation"
    p1_foot.font.name = "Calibri"
    p1_foot.font.size = Pt(10)
    p1_foot.font.bold = True
    p1_foot.font.color.rgb = TEXT_PURPLE
    p1_foot.space_before = Pt(14)

    c2 = add_card_box(s6, Inches(6.83), Inches(1.65), Inches(5.7), Inches(5.35), border_color=BORDER_GREEN)
    tf2 = c2.text_frame

    p2_h = tf2.paragraphs[0]
    p2_h.alignment = PP_ALIGN.LEFT
    p2_h.text = "TRUTH TABLES & FORMAL PROOFS"
    p2_h.font.name = "Arial"
    p2_h.font.size = Pt(14)
    p2_h.font.bold = True
    p2_h.font.color.rgb = BORDER_GREEN

    p2_sub = tf2.add_paragraph()
    p2_sub.alignment = PP_ALIGN.LEFT
    p2_sub.text = "2ⁿ Exhaustive Interpretation & Normal Forms"
    p2_sub.font.name = "Calibri"
    p2_sub.font.size = Pt(10.5)
    p2_sub.font.bold = True
    p2_sub.font.color.rgb = TEXT_GOLD
    p2_sub.space_before = Pt(2)

    items_l2 = [
        ("Full 2^n Truth Tables", "Generates complete 2^n interpretation tables showing every combination of T and F."),
        ("Canonical DNF & CNF", "Automatically calculates Disjunctive and Conjunctive Normal Forms for any expression."),
        ("Tautology Checker", "Instantly verifies if an expression is always True (Tautology) or False (Contradiction)."),
        ("Counter-Example Finder", "If a theorem is invalid, it highlights the exact variable assignment that breaks it."),
        ("LaTeX Export", "Renders publication-ready LaTeX syntax for class assignments, quizzes, and papers."),
    ]
    append_bullets(tf2, items_l2, title_color=TEXT_GREEN, title_font_size=12, desc_font_size=11, spacing=10)

    p2_foot = tf2.add_paragraph()
    p2_foot.alignment = PP_ALIGN.LEFT
    p2_foot.text = "Output: Exhaustive 2ⁿ Table + Canonical Forms + LaTeX Math"
    p2_foot.font.name = "Calibri"
    p2_foot.font.size = Pt(10)
    p2_foot.font.bold = True
    p2_foot.font.color.rgb = TEXT_GREEN
    p2_foot.space_before = Pt(14)

    # =========================================================================
    # SLIDE 7: MODULE 3 — MATHEMATICAL PROOF SOLVERS (3 Columns)
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    add_bg(s7)
    owner_sub = " (Hari's Contribution)" if with_names else ""
    add_header(s7, f"Module 3: Step-by-Step Proof & Countability Solvers{owner_sub}", "CORE DOMAIN 3 • PROOF SOLVERS")

    c1 = add_card_box(s7, Inches(0.8), Inches(1.65), Inches(3.73), Inches(5.35), border_color=BORDER_GOLD)
    tf1 = c1.text_frame
    tf1.margin_left = tf1.margin_right = Inches(0.22)
    tf1.margin_top = Inches(0.22)
    tf1.margin_bottom = Inches(0.15)

    p1_h = tf1.paragraphs[0]
    p1_h.alignment = PP_ALIGN.LEFT
    p1_h.text = "INCLUSION-EXCLUSION (PIE)"
    p1_h.font.name = "Arial"
    p1_h.font.size = Pt(12.5)
    p1_h.font.bold = True
    p1_h.font.color.rgb = BORDER_GOLD

    p1_sub = tf1.add_paragraph()
    p1_sub.alignment = PP_ALIGN.LEFT
    p1_sub.text = "Cardinality & Survey Counting Solver"
    p1_sub.font.name = "Calibri"
    p1_sub.font.size = Pt(9.5)
    p1_sub.font.bold = True
    p1_sub.font.color.rgb = TEXT_WHITE
    p1_sub.space_before = Pt(2)

    items_p1 = [
        ("Arithmetic Solver", "Solves survey and cardinality counting problems for 2 and 3 sets."),
        ("Formula Steps", "Breaks down |A ∪ B ∪ C| = Σ|A| - Σ|A ∩ B| + |A ∩ B ∩ C| step-by-step."),
        ("Variable Sliders", "Adjust set sizes and overlap counts with live union recomputation."),
        ("Problem Presets", "Includes real-world examples (student courses, languages, sports)."),
    ]
    append_bullets(tf1, items_p1, title_color=TEXT_GOLD, title_font_size=11, desc_font_size=10, spacing=9)

    p1_foot = tf1.add_paragraph()
    p1_foot.alignment = PP_ALIGN.LEFT
    p1_foot.text = "Solver: Step-by-step cardinality steps"
    p1_foot.font.name = "Calibri"
    p1_foot.font.size = Pt(8.5)
    p1_foot.font.bold = True
    p1_foot.font.color.rgb = TEXT_GOLD
    p1_foot.space_before = Pt(12)

    c2 = add_card_box(s7, Inches(4.8), Inches(1.65), Inches(3.73), Inches(5.35), border_color=BORDER_CYAN)
    tf2 = c2.text_frame
    tf2.margin_left = tf2.margin_right = Inches(0.22)
    tf2.margin_top = Inches(0.22)
    tf2.margin_bottom = Inches(0.15)

    p2_h = tf2.paragraphs[0]
    p2_h.alignment = PP_ALIGN.LEFT
    p2_h.text = "CANTOR'S DIAGONALIZATION"
    p2_h.font.name = "Arial"
    p2_h.font.size = Pt(12.5)
    p2_h.font.bold = True
    p2_h.font.color.rgb = BORDER_CYAN

    p2_sub = tf2.add_paragraph()
    p2_sub.alignment = PP_ALIGN.LEFT
    p2_sub.text = "Countability & Infinity Verification"
    p2_sub.font.name = "Calibri"
    p2_sub.font.size = Pt(9.5)
    p2_sub.font.bold = True
    p2_sub.font.color.rgb = TEXT_WHITE
    p2_sub.space_before = Pt(2)

    items_p2 = [
        ("Uncountability of R", "Proves real numbers in [0, 1) cannot be mapped 1-to-1 to integers."),
        ("Interactive Grid", "Displays an infinite decimal matrix with dynamic diagonal tracking."),
        ("Anti-Diagonal Flip", "Inverts diagonal digits to construct a new number not in the list."),
        ("Snake Path for Q+", "Visualizes Cantor's snake path mapping ℕ to ℚ⁺ to prove rationals countable."),
    ]
    append_bullets(tf2, items_p2, title_color=TEXT_CYAN, title_font_size=11, desc_font_size=10, spacing=9)

    p2_foot = tf2.add_paragraph()
    p2_foot.alignment = PP_ALIGN.LEFT
    p2_foot.text = "Proof: Interactive anti-diagonal construction"
    p2_foot.font.name = "Calibri"
    p2_foot.font.size = Pt(8.5)
    p2_foot.font.bold = True
    p2_foot.font.color.rgb = TEXT_CYAN
    p2_foot.space_before = Pt(12)

    c3 = add_card_box(s7, Inches(8.8), Inches(1.65), Inches(3.73), Inches(5.35), border_color=BORDER_CRIMSON)
    tf3 = c3.text_frame
    tf3.margin_left = tf3.margin_right = Inches(0.22)
    tf3.margin_top = Inches(0.22)
    tf3.margin_bottom = Inches(0.15)

    p3_h = tf3.paragraphs[0]
    p3_h.alignment = PP_ALIGN.LEFT
    p3_h.text = "MATHEMATICAL INDUCTION"
    p3_h.font.name = "Arial"
    p3_h.font.size = Pt(12.5)
    p3_h.font.bold = True
    p3_h.font.color.rgb = BORDER_CRIMSON

    p3_sub = tf3.add_paragraph()
    p3_sub.alignment = PP_ALIGN.LEFT
    p3_sub.text = "Formal Recursive Proof Pipeline"
    p3_sub.font.name = "Calibri"
    p3_sub.font.size = Pt(9.5)
    p3_sub.font.bold = True
    p3_sub.font.color.rgb = TEXT_WHITE
    p3_sub.space_before = Pt(2)

    items_p3 = [
        ("3-Stage Pipeline", "Breaks down Base Step P(1), Hypothesis P(k), and Inductive Step P(k+1)."),
        ("Algebraic Expansion", "Expands and factors summation formulas like Σ i = n(n+1)/2 step-by-step."),
        ("Visual Proof Link", "Highlights the exact algebraic substitution connecting P(k) directly to P(k+1)."),
        ("Classic Theorems", "Pre-loaded with arithmetic series, geometric sums, and divisibility proofs."),
    ]
    append_bullets(tf3, items_p3, title_color=TEXT_CRIMSON, title_font_size=11, desc_font_size=10, spacing=9)

    p3_foot = tf3.add_paragraph()
    p3_foot.alignment = PP_ALIGN.LEFT
    p3_foot.text = "Pipeline: Base Case → Hypothesis → Induction"
    p3_foot.font.name = "Calibri"
    p3_foot.font.size = Pt(8.5)
    p3_foot.font.bold = True
    p3_foot.font.color.rgb = TEXT_CRIMSON
    p3_foot.space_before = Pt(12)

    # =========================================================================
    # SLIDE 8: MODULE 4 — RELATIONS & FUNCTIONS
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    add_bg(s8)
    owner_sub = " (Krishna's Contribution)" if with_names else ""
    add_header(s8, f"Module 4: Relations, Order Theory & Functions{owner_sub}", "CORE DOMAIN 4 • RELATIONS & FUNCTIONS")

    c1 = add_card_box(s8, Inches(0.8), Inches(1.65), Inches(5.7), Inches(5.35), border_color=BORDER_GOLD)
    tf1 = c1.text_frame

    p1_h = tf1.paragraphs[0]
    p1_h.alignment = PP_ALIGN.LEFT
    p1_h.text = "RELATION MATRIX & PROPERTIES"
    p1_h.font.name = "Arial"
    p1_h.font.size = Pt(14)
    p1_h.font.bold = True
    p1_h.font.color.rgb = BORDER_GOLD

    p1_sub = tf1.add_paragraph()
    p1_sub.alignment = PP_ALIGN.LEFT
    p1_sub.text = "Binary Relations & Warshall's Algorithm"
    p1_sub.font.name = "Calibri"
    p1_sub.font.size = Pt(10.5)
    p1_sub.font.bold = True
    p1_sub.font.color.rgb = TEXT_GOLD
    p1_sub.space_before = Pt(2)

    items_r1 = [
        ("Interactive Matrix Grid", "Click grid cells to toggle pairs (a, b) on a finite set A = {1, 2, 3, 4}."),
        ("Instant Property Checking", "Real-time verification of Reflexive, Symmetric, Transitive, and Anti-symmetric properties."),
        ("Equivalence Relations", "Highlights when a relation forms equivalence classes [a] and partitions the set."),
        ("Warshall's Algorithm", "Step-by-step matrix derivation computing Transitive Closure R+ in O(n^3) operations."),
        ("Directed Relation Graph", "Visualizes relation pairs as a directed graph with animated self-loops and dual edges."),
    ]
    append_bullets(tf1, items_r1, title_color=TEXT_GOLD, title_font_size=12, desc_font_size=11, spacing=10)

    p1_foot = tf1.add_paragraph()
    p1_foot.alignment = PP_ALIGN.LEFT
    p1_foot.text = "Algorithm: Warshall's Transitive Closure in O(n³) with Step Matrix"
    p1_foot.font.name = "Calibri"
    p1_foot.font.size = Pt(10)
    p1_foot.font.bold = True
    p1_foot.font.color.rgb = TEXT_GOLD
    p1_foot.space_before = Pt(14)

    c2 = add_card_box(s8, Inches(6.83), Inches(1.65), Inches(5.7), Inches(5.35), border_color=BORDER_PURPLE)
    tf2 = c2.text_frame

    p2_h = tf2.paragraphs[0]
    p2_h.alignment = PP_ALIGN.LEFT
    p2_h.text = "HASSE DIAGRAMS & FUNCTIONS"
    p2_h.font.name = "Arial"
    p2_h.font.size = Pt(14)
    p2_h.font.bold = True
    p2_h.font.color.rgb = BORDER_PURPLE

    p2_sub = tf2.add_paragraph()
    p2_sub.alignment = PP_ALIGN.LEFT
    p2_sub.text = "Poset Trees, Lattices & Function Mappings"
    p2_sub.font.name = "Calibri"
    p2_sub.font.size = Pt(10.5)
    p2_sub.font.bold = True
    p2_sub.font.color.rgb = TEXT_GOLD
    p2_sub.space_before = Pt(2)

    items_r2 = [
        ("Hasse Diagrams for Posets", "Draws clean order hierarchy trees by stripping redundant self-loops and transitive edges."),
        ("Lattice & Bound Detection", "Identifies maximal/minimal elements, upper/lower bounds, and partial order structures."),
        ("Lattice GLB/LUB Analysis", "Verifies if every pair of elements has a unique greatest lower bound and least upper bound."),
        ("Function Mapping Analyzer", "Visual arrow diagrams connecting domain elements to codomain targets with vector lines."),
        ("Function Classification", "Automatically classifies mappings as Injective (one-to-one), Surjective (onto), or Bijective."),
    ]
    append_bullets(tf2, items_r2, title_color=TEXT_PURPLE, title_font_size=12, desc_font_size=11, spacing=10)

    p2_foot = tf2.add_paragraph()
    p2_foot.alignment = PP_ALIGN.LEFT
    p2_foot.text = "Hierarchy: Transitive Reduction for Posets + Function Type Classifier"
    p2_foot.font.name = "Calibri"
    p2_foot.font.size = Pt(10)
    p2_foot.font.bold = True
    p2_foot.font.color.rgb = TEXT_PURPLE
    p2_foot.space_before = Pt(14)

    # =========================================================================
    # SLIDE 9: MODULE 5 — FINITE AUTOMATA (DFA / NFA)
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    add_bg(s9)
    owner_sub = " (Akash's Contribution)" if with_names else ""
    add_header(s9, f"Module 5: Finite Automata (DFA / NFA) Visualizer{owner_sub}", "CORE DOMAIN 5 • AUTOMATA THEORY")

    c1 = add_card_box(s9, Inches(0.8), Inches(1.65), Inches(5.7), Inches(5.35), border_color=BORDER_CYAN)
    tf1 = c1.text_frame

    p1_h = tf1.paragraphs[0]
    p1_h.alignment = PP_ALIGN.LEFT
    p1_h.text = "STATE GRAPH CANVAS & SIMULATION"
    p1_h.font.name = "Arial"
    p1_h.font.size = Pt(14)
    p1_h.font.bold = True
    p1_h.font.color.rgb = BORDER_CYAN

    p1_sub = tf1.add_paragraph()
    p1_sub.alignment = PP_ALIGN.LEFT
    p1_sub.text = "DFA/NFA Graph Editor & Glowing Step Playback"
    p1_sub.font.name = "Calibri"
    p1_sub.font.size = Pt(10.5)
    p1_sub.font.bold = True
    p1_sub.font.color.rgb = TEXT_GOLD
    p1_sub.space_before = Pt(2)

    items_a1 = [
        ("Custom Circular States", "Add states q0, q1 with start arrow (→q0) and concentric double-rings for accept states."),
        ("Glowing Step Playback", "Type an input string (e.g. '101') and watch active states glow with animated pulse rings."),
        ("Active Edge Highlighting", "Transition arrows light up with a drop-shadow glow as characters are consumed."),
        ("Batch Test Suite", "Test multiple strings simultaneously with green ACCEPTED and red REJECTED badges."),
        ("Execution Trace Table", "Displays an interactive step-by-step trace showing current state, symbol, and next state."),
    ]
    append_bullets(tf1, items_a1, title_color=TEXT_CYAN, title_font_size=12, desc_font_size=11, spacing=10)

    p1_foot = tf1.add_paragraph()
    p1_foot.alignment = PP_ALIGN.LEFT
    p1_foot.text = "Simulation: Real-Time Glowing State Pulses & Multi-String Testing"
    p1_foot.font.name = "Calibri"
    p1_foot.font.size = Pt(10)
    p1_foot.font.bold = True
    p1_foot.font.color.rgb = TEXT_CYAN
    p1_foot.space_before = Pt(14)

    c2 = add_card_box(s9, Inches(6.83), Inches(1.65), Inches(5.7), Inches(5.35), border_color=BORDER_CRIMSON)
    tf2 = c2.text_frame

    p2_h = tf2.paragraphs[0]
    p2_h.alignment = PP_ALIGN.LEFT
    p2_h.text = "CONVERSION & MINIMIZATION SOLVERS"
    p2_h.font.name = "Arial"
    p2_h.font.size = Pt(14)
    p2_h.font.bold = True
    p2_h.font.color.rgb = BORDER_CRIMSON

    p2_sub = tf2.add_paragraph()
    p2_sub.alignment = PP_ALIGN.LEFT
    p2_sub.text = "NFA → DFA Subset Construction & Hopcroft Algorithm"
    p2_sub.font.name = "Calibri"
    p2_sub.font.size = Pt(10.5)
    p2_sub.font.bold = True
    p2_sub.font.color.rgb = TEXT_GOLD
    p2_sub.space_before = Pt(2)

    items_a2 = [
        ("NFA → DFA Subset Construction", "Calculates ε-closures and powerset tables with 1-click 'Load Converted DFA to Canvas'."),
        ("Hopcroft DFA Minimization", "Runs partition refinement (0-equiv, 1-equiv) and builds the Distinguishability Matrix."),
        ("1-Click Minimal Graph", "Instantly merges redundant states and renders the minimal equivalent DFA on screen."),
        ("Distinguishability Table", "Displays lower-triangular table marking distinct pairs to visually prove equivalence."),
        ("Moore ⇄ Mealy Transducers", "Simulates state-output vs edge-output machines with cumulative output sequences."),
    ]
    append_bullets(tf2, items_a2, title_color=TEXT_CRIMSON, title_font_size=12, desc_font_size=11, spacing=10)

    p2_foot = tf2.add_paragraph()
    p2_foot.alignment = PP_ALIGN.LEFT
    p2_foot.text = "Solvers: Hopcroft Minimization + Powerset Engine + Transducers"
    p2_foot.font.name = "Calibri"
    p2_foot.font.size = Pt(10)
    p2_foot.font.bold = True
    p2_foot.font.color.rgb = TEXT_CRIMSON
    p2_foot.space_before = Pt(14)

    # =========================================================================
    # SLIDE 10: INTELLIGENT LOGICAI CHATBOT
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    add_bg(s10)
    owner_sub = " (Akash's Contribution)" if with_names else ""
    add_header(s10, f"LogicAI: Context-Aware Mathematical Tutor{owner_sub}", "INTELLIGENT AI TUTORING")

    c1 = add_card_box(s10, Inches(0.8), Inches(1.65), Inches(5.7), Inches(5.35), border_color=BORDER_PURPLE)
    tf1 = c1.text_frame

    p1_h = tf1.paragraphs[0]
    p1_h.alignment = PP_ALIGN.LEFT
    p1_h.text = "LIVE CANVAS CONTEXT INJECTION"
    p1_h.font.name = "Arial"
    p1_h.font.size = Pt(14)
    p1_h.font.bold = True
    p1_h.font.color.rgb = BORDER_PURPLE

    p1_sub = tf1.add_paragraph()
    p1_sub.alignment = PP_ALIGN.LEFT
    p1_sub.text = "Real-Time Visual State Perception & Guidance"
    p1_sub.font.name = "Calibri"
    p1_sub.font.size = Pt(10.5)
    p1_sub.font.bold = True
    p1_sub.font.color.rgb = TEXT_GOLD
    p1_sub.space_before = Pt(2)

    items_ai1 = [
        ("Direct Canvas Visibility", "LogicAI actually sees what is on your screen: active states, gate inputs, sets, and formulas."),
        ("Step-by-Step Explanations", "Click 'Explain this step' to learn exactly why state q0 moved to q1 on reading symbol '0'."),
        ("Diagnostic Feedback", "Detects disconnected handles, duplicate elements, or invalid transitions and suggests remedies."),
        ("Quick-Action Buttons", "One-click chips for 'Explain this step', 'Generate example', and 'Give me a hint'."),
        ("Socratic Guidance", "Prompts students to discover underlying mathematical logic rather than giving raw answers."),
    ]
    append_bullets(tf1, items_ai1, title_color=TEXT_PURPLE, title_font_size=12, desc_font_size=11, spacing=10)

    p1_foot = tf1.add_paragraph()
    p1_foot.alignment = PP_ALIGN.LEFT
    p1_foot.text = "Perception: Injects Complete Active Graph AST Directly into Prompts"
    p1_foot.font.name = "Calibri"
    p1_foot.font.size = Pt(10)
    p1_foot.font.bold = True
    p1_foot.font.color.rgb = TEXT_PURPLE
    p1_foot.space_before = Pt(14)

    c2 = add_card_box(s10, Inches(6.83), Inches(1.65), Inches(5.7), Inches(5.35), border_color=BORDER_CYAN)
    tf2 = c2.text_frame

    p2_h = tf2.paragraphs[0]
    p2_h.alignment = PP_ALIGN.LEFT
    p2_h.text = "HYBRID LLM + LOCAL ENGINE ARCHITECTURE"
    p2_h.font.name = "Arial"
    p2_h.font.size = Pt(14)
    p2_h.font.bold = True
    p2_h.font.color.rgb = BORDER_CYAN

    p2_sub = tf2.add_paragraph()
    p2_sub.alignment = PP_ALIGN.LEFT
    p2_sub.text = "Next.js API Route, Gemini LLM & Offline Fallback"
    p2_sub.font.name = "Calibri"
    p2_sub.font.size = Pt(10.5)
    p2_sub.font.bold = True
    p2_sub.font.color.rgb = TEXT_GOLD
    p2_sub.space_before = Pt(2)

    items_ai2 = [
        ("Next.js /api/chat Route", "Server route connecting LogicAI directly to Google Gemini, Groq, and OpenAI models."),
        ("In-App Settings Modal", "Students can connect their own free Gemini or Groq API key directly in the UI via the ⚙️ modal."),
        ("Answers ANY Question", "With live LLM connected, answers open-ended questions across all computer science theory."),
        ("Zero-Crash Offline Fallback", "If no key or internet is available, falls back to local mathematical AST rules smoothly."),
        ("Privacy & Local Execution", "Option to run with local models via Ollama with zero student telemetry or data tracking."),
    ]
    append_bullets(tf2, items_ai2, title_color=TEXT_CYAN, title_font_size=12, desc_font_size=11, spacing=10)

    p2_foot = tf2.add_paragraph()
    p2_foot.alignment = PP_ALIGN.LEFT
    p2_foot.text = "Backend: Secure /api/chat Streaming + Deterministic Offline AST"
    p2_foot.font.name = "Calibri"
    p2_foot.font.size = Pt(10)
    p2_foot.font.bold = True
    p2_foot.font.color.rgb = TEXT_CYAN
    p2_foot.space_before = Pt(14)

    # =========================================================================
    # SLIDE 11: INDIVIDUAL CONTRIBUTIONS / TEAM BREAKDOWN (5 Columns, Filled Richly)
    # =========================================================================
    s11 = prs.slides.add_slide(blank_layout)
    add_bg(s11)
    add_header(s11, "Team Roles & Technical Contribution Breakdown", "INDIVIDUAL CONTRIBUTIONS")

    members = [
        ("Akash", "Team Lead & System Architect", [
            ("Automata Engine", "DFA/NFA simulator, glowing stepper, and batch test runner."),
            ("Algorithms", "NFA to DFA subset construction & Hopcroft DFA minimization."),
            ("LogicAI Chatbot", "Canvas context injection & live LLM integration with API modal."),
            ("Frontend IDE", "Next.js 16 shell, dock panels, and custom glowing node components."),
        ], "Next.js 16 • React Flow • Gemini LLM", BORDER_CYAN),

        ("Sanskar", "Set Theory & Venn Specialist", [
            ("Set Builder", "Custom sets, set roster notation, and bracket parsing."),
            ("Set Operations", "Union, Intersection, Difference, and Power Set P(A)."),
            ("Dynamic Venn", "Interactive 2-set & 3-set SVG diagrams with 8-region spatial sorting."),
            ("Live Reactivity", "Zustand synchronization re-evaluating sets upon node mutations."),
        ], "SVG Math • Set Theory • Zustand", BORDER_GOLD),

        ("Ghansham", "Propositional Logic Specialist", [
            ("Logic Gate Canvas", "AND, OR, NOT, IMPLIES, and IFF gates with signal flow."),
            ("Truth Table Engine", "Exhaustive 2^n valuation tables for up to 16 boolean variables."),
            ("Normal Forms", "Automated DNF, CNF, and formal Tautology / Contradiction verification."),
            ("LaTeX Export", "Mathematical formula synthesis into publication LaTeX."),
        ], "Boolean AST • Formal Logic • Proofs", BORDER_GREEN),

        ("Hari", "Proof & Verification Specialist", [
            ("PIE Counting Solver", "Step-by-step arithmetic solver for Inclusion-Exclusion problems."),
            ("Cantor Visualizer", "Uncountability proof of R with interactive anti-diagonal inversion."),
            ("Snake Path Engine", "Countability of positive rational numbers ℚ⁺ via snake grid."),
            ("Induction Pipeline", "Base step, hypothesis, and inductive step proof derivations."),
        ], "Proof Theory • Number Theory • Algorithms", BORDER_PURPLE),

        ("Krishna", "Relations & Order Specialist", [
            ("Relation Matrix", "Interactive matrix checking Reflexive, Symmetric, and Transitive rules."),
            ("Warshall's Algorithm", "Step-by-step matrix derivation computing transitive closure R+."),
            ("Hasse Diagrams", "Automated poset trees stripping reflexive and transitive edges."),
            ("Function Analyzer", "Arrow mapping vectors with Injective / Surjective classification."),
        ], "Matrix Ops • Order Theory • Graph Math", BORDER_CRIMSON),
    ] if with_names else [
        ("Team Member 1", "Lead Architect & Automata Engineer", [
            ("Automata Engine", "DFA/NFA simulator, glowing stepper, and batch test runner."),
            ("Algorithms", "NFA to DFA subset construction & Hopcroft DFA minimization."),
            ("LogicAI Chatbot", "Canvas context injection & live LLM integration with API modal."),
            ("Frontend IDE", "Next.js 16 shell, dock panels, and custom glowing node components."),
        ], "Next.js 16 • React Flow • Gemini LLM", BORDER_CYAN),

        ("Team Member 2", "Set Theory & Venn Specialist", [
            ("Set Builder", "Custom sets, set roster notation, and bracket parsing."),
            ("Set Operations", "Union, Intersection, Difference, and Power Set P(A)."),
            ("Dynamic Venn", "Interactive 2-set & 3-set SVG diagrams with 8-region spatial sorting."),
            ("Live Reactivity", "Zustand synchronization re-evaluating sets upon node mutations."),
        ], "SVG Math • Set Theory • Zustand", BORDER_GOLD),

        ("Team Member 3", "Propositional Logic Specialist", [
            ("Logic Gate Canvas", "AND, OR, NOT, IMPLIES, and IFF gates with signal flow."),
            ("Truth Table Engine", "Exhaustive 2^n valuation tables for up to 16 boolean variables."),
            ("Normal Forms", "Automated DNF, CNF, and formal Tautology / Contradiction verification."),
            ("LaTeX Export", "Mathematical formula synthesis into publication LaTeX."),
        ], "Boolean AST • Formal Logic • Proofs", BORDER_GREEN),

        ("Team Member 4", "Proof & Verification Specialist", [
            ("PIE Counting Solver", "Step-by-step arithmetic solver for Inclusion-Exclusion problems."),
            ("Cantor Visualizer", "Uncountability proof of R with interactive anti-diagonal inversion."),
            ("Snake Path Engine", "Countability of positive rational numbers ℚ⁺ via snake grid."),
            ("Induction Pipeline", "Base step, hypothesis, and inductive step proof derivations."),
        ], "Proof Theory • Number Theory • Algorithms", BORDER_PURPLE),

        ("Team Member 5", "Relations & Order Specialist", [
            ("Relation Matrix", "Interactive matrix checking Reflexive, Symmetric, and Transitive rules."),
            ("Warshall's Algorithm", "Step-by-step matrix derivation computing transitive closure R+."),
            ("Hasse Diagrams", "Automated poset trees stripping reflexive and transitive edges."),
            ("Function Analyzer", "Arrow mapping vectors with Injective / Surjective classification."),
        ], "Matrix Ops • Order Theory • Graph Math", BORDER_CRIMSON),
    ]

    card_w = Inches(2.2)
    gap = Inches(0.183)
    for i, (m_name, m_role, m_bullets, m_tech, m_col) in enumerate(members):
        c_left = Inches(0.8 + i * (2.2 + 0.183))
        c = add_card_box(s11, c_left, Inches(1.65), card_w, Inches(5.35), border_color=m_col)
        tf = c.text_frame
        tf.margin_left = tf.margin_right = Inches(0.16)
        tf.margin_top = Inches(0.2)
        tf.margin_bottom = Inches(0.15)

        # Name
        p1 = tf.paragraphs[0]
        p1.alignment = PP_ALIGN.LEFT
        p1.text = m_name
        p1.font.name = "Arial"
        p1.font.size = Pt(13)
        p1.font.bold = True
        p1.font.color.rgb = m_col

        # Role
        p2 = tf.add_paragraph()
        p2.alignment = PP_ALIGN.LEFT
        p2.text = m_role
        p2.font.name = "Calibri"
        p2.font.size = Pt(9.5)
        p2.font.bold = True
        p2.font.color.rgb = TEXT_WHITE
        p2.space_before = Pt(2)

        # Section label
        p_sec = tf.add_paragraph()
        p_sec.alignment = PP_ALIGN.LEFT
        p_sec.text = "CORE DELIVERABLES"
        p_sec.font.name = "Arial"
        p_sec.font.size = Pt(8.5)
        p_sec.font.bold = True
        p_sec.font.color.rgb = m_col
        p_sec.space_before = Pt(8)

        # Bullets
        for b_head, b_desc in m_bullets:
            pb = tf.add_paragraph()
            pb.alignment = PP_ALIGN.LEFT
            pb.space_before = Pt(6)
            r1 = pb.add_run()
            r1.text = f"• {b_head}: "
            r1.font.name = "Calibri"
            r1.font.size = Pt(9.5)
            r1.font.bold = True
            r1.font.color.rgb = TEXT_WHITE
            r2 = pb.add_run()
            r2.text = b_desc
            r2.font.name = "Calibri"
            r2.font.size = Pt(9)
            r2.font.color.rgb = TEXT_MUTED

        # Tech & Status footer tag
        p_tf = tf.add_paragraph()
        p_tf.alignment = PP_ALIGN.LEFT
        p_tf.text = f"Stack: {m_tech}\nStatus: ✓ Verified & Tested"
        p_tf.font.name = "Calibri"
        p_tf.font.size = Pt(8.5)
        p_tf.font.bold = True
        p_tf.font.color.rgb = TEXT_GOLD
        p_tf.space_before = Pt(10)

    # =========================================================================
    # SLIDE 12: FUTURE SCOPE & ROADMAP (Phase 2 Modules)
    # =========================================================================
    s12 = prs.slides.add_slide(blank_layout)
    add_bg(s12)
    add_header(s12, "Future Roadmap: Context-Free Grammars & Turing Machines", "FUTURE EXPANSION ROADMAP")

    c1 = add_card_box(s12, Inches(0.8), Inches(1.65), Inches(5.7), Inches(5.35), border_color=BORDER_GOLD)
    tf1 = c1.text_frame

    p1_h = tf1.paragraphs[0]
    p1_h.alignment = PP_ALIGN.LEFT
    p1_h.text = "MODULE 6: CONTEXT-FREE GRAMMAR (CFG) [PHASE 2]"
    p1_h.font.name = "Arial"
    p1_h.font.size = Pt(14)
    p1_h.font.bold = True
    p1_h.font.color.rgb = BORDER_GOLD

    p1_sub = tf1.add_paragraph()
    p1_sub.alignment = PP_ALIGN.LEFT
    p1_sub.text = "Grammar Rules, Parse Trees & Chomsky Normal Form"
    p1_sub.font.name = "Calibri"
    p1_sub.font.size = Pt(10.5)
    p1_sub.font.bold = True
    p1_sub.font.color.rgb = TEXT_GOLD
    p1_sub.space_before = Pt(2)

    items_f1 = [
        ("Grammar Rule Builder", "Interactive editor to type production rules like S -> aSb | ε."),
        ("Dynamic Parse Trees", "Visual syntax tree generation showing exact leftmost and rightmost derivation steps."),
        ("Chomsky Normal Form (CNF)", "Automated 4-step converter eliminating ε-rules, unit rules, and useless symbols."),
        ("CYK Parsing Algorithm", "Dynamic programming triangular parsing table verifying string membership in O(n^3)."),
        ("Ambiguity Detection", "Highlights ambiguous grammars that produce multiple distinct parse trees for one string."),
    ]
    append_bullets(tf1, items_f1, title_color=TEXT_GOLD, title_font_size=12, desc_font_size=11, spacing=10)

    p1_foot = tf1.add_paragraph()
    p1_foot.alignment = PP_ALIGN.LEFT
    p1_foot.text = "Phase 2 Target: Visual CFG Syntax Trees & CYK Parsing Grid"
    p1_foot.font.name = "Calibri"
    p1_foot.font.size = Pt(10)
    p1_foot.font.bold = True
    p1_foot.font.color.rgb = TEXT_GOLD
    p1_foot.space_before = Pt(14)

    c2 = add_card_box(s12, Inches(6.83), Inches(1.65), Inches(5.7), Inches(5.35), border_color=BORDER_PURPLE)
    tf2 = c2.text_frame

    p2_h = tf2.paragraphs[0]
    p2_h.alignment = PP_ALIGN.LEFT
    p2_h.text = "MODULE 7: PDA & TURING MACHINES [PHASE 2]"
    p2_h.font.name = "Arial"
    p2_h.font.size = Pt(14)
    p2_h.font.bold = True
    p2_h.font.color.rgb = BORDER_PURPLE

    p2_sub = tf2.add_paragraph()
    p2_sub.alignment = PP_ALIGN.LEFT
    p2_sub.text = "Pushdown Automata, Stack Memory & Infinite Tape"
    p2_sub.font.name = "Calibri"
    p2_sub.font.size = Pt(10.5)
    p2_sub.font.bold = True
    p2_sub.font.color.rgb = TEXT_GOLD
    p2_sub.space_before = Pt(2)

    items_f2 = [
        ("Pushdown Automata (PDA)", "Interactive LIFO stack animator showing real-time push and pop transitions."),
        ("Dual Acceptance Modes", "Visualize acceptance by Final State vs Empty Stack criteria."),
        ("Turing Machine Infinite Tape", "Interactive 2-way tape with head movements (Left, Right, Stay)."),
        ("Multi-Tape Simulation", "Visual execution of multi-tape Turing machines for complex computational problems."),
        ("Halting Problem Proofs", "Visual explanations of computability limits and undecidable languages."),
    ]
    append_bullets(tf2, items_f2, title_color=TEXT_PURPLE, title_font_size=12, desc_font_size=11, spacing=10)

    p2_foot = tf2.add_paragraph()
    p2_foot.alignment = PP_ALIGN.LEFT
    p2_foot.text = "Phase 2 Target: LIFO Stack Visualizer & Turing Halting Proofs"
    p2_foot.font.name = "Calibri"
    p2_foot.font.size = Pt(10)
    p2_foot.font.bold = True
    p2_foot.font.color.rgb = TEXT_PURPLE
    p2_foot.space_before = Pt(14)

    # =========================================================================
    # SLIDE 13: CONCLUSION & PROJECT IMPACT
    # =========================================================================
    s13 = prs.slides.add_slide(blank_layout)
    add_bg(s13)
    add_header(s13, "Conclusion: Making Computer Science Theory Tangible", "SUMMARY & IMPACT")

    card_concl = add_card_box(s13, Inches(0.8), Inches(1.65), Inches(11.73), Inches(5.35), border_color=BORDER_GREEN)
    tf_c = card_concl.text_frame
    tf_c.margin_left = tf_c.margin_right = Inches(0.4)
    tf_c.margin_top = Inches(0.3)
    tf_c.margin_bottom = Inches(0.25)

    p_ch = tf_c.paragraphs[0]
    p_ch.alignment = PP_ALIGN.LEFT
    p_ch.text = "LOGICVERSE IMPACT SUMMARY & KEY TAKEAWAYS"
    p_ch.font.name = "Arial"
    p_ch.font.size = Pt(15)
    p_ch.font.bold = True
    p_ch.font.color.rgb = BORDER_GREEN

    p_csub = tf_c.add_paragraph()
    p_csub.alignment = PP_ALIGN.LEFT
    p_csub.text = "Transforming Theoretical Computer Science Education"
    p_csub.font.name = "Calibri"
    p_csub.font.size = Pt(11)
    p_csub.font.bold = True
    p_csub.font.color.rgb = TEXT_GOLD
    p_csub.space_before = Pt(2)

    concl_items = [
        ("Interactive Learning Paradigm", "Replaces static equations and dry paper proofs with hands-on visual canvas simulation."),
        ("5 Core Disciplines Fully Operational", "Set Theory, Propositional Logic, Proof Solvers, Relations/Functions, and Finite Automata running with 51 passing automated tests."),
        ("Real AI Context Integration", "LogicAI is not a generic chatbot; it has direct visibility into canvas nodes and gives personalized pedagogical guidance."),
        ("Production-Grade Engineering", "Built on Next.js 16, React Flow, TypeScript, and Zustand with instant load times and zero compilation errors."),
        ("Extensible Architecture Ready for Phase 2", "Modular design enables seamless plug-and-play addition of Context-Free Grammars and Turing Machines."),
    ]
    for title, desc in concl_items:
        p = tf_c.add_paragraph()
        p.alignment = PP_ALIGN.LEFT
        p.space_before = Pt(11)
        p.space_after = Pt(2)
        r1 = p.add_run()
        r1.text = f"✓  {title}: "
        r1.font.name = "Calibri"
        r1.font.size = Pt(12)
        r1.font.bold = True
        r1.font.color.rgb = TEXT_WHITE
        r2 = p.add_run()
        r2.text = desc
        r2.font.name = "Calibri"
        r2.font.size = Pt(11.5)
        r2.font.color.rgb = TEXT_MUTED

    p_end = tf_c.add_paragraph()
    p_end.alignment = PP_ALIGN.LEFT
    p_end.space_before = Pt(18)
    p_end.text = "Thank You! • Open for Live Demonstration & Questions"
    p_end.font.name = "Arial"
    p_end.font.size = Pt(13.5)
    p_end.font.bold = True
    p_end.font.color.rgb = TEXT_GOLD

    p_git = tf_c.add_paragraph()
    p_git.alignment = PP_ALIGN.LEFT
    p_git.space_before = Pt(4)
    p_git.text = "GitHub Repository: https://github.com/akash20065ray-sys/Logic_verse"
    p_git.font.name = "Calibri"
    p_git.font.size = Pt(11)
    p_git.font.color.rgb = TEXT_CYAN

    # Save presentation
    prs.save(filename)
    print(f"[OK] Generated: {filename}")


if __name__ == "__main__":
    out_dir = r"c:\logicverse-v0.1-foundation"
    ppt_with_names = os.path.join(out_dir, "LogicVerse_Presentation_With_Names.pptx")
    ppt_without_names = os.path.join(out_dir, "LogicVerse_Presentation_Without_Names.pptx")
    
    build_presentation(with_names=True, filename=ppt_with_names)
    build_presentation(with_names=False, filename=ppt_without_names)

    # Also automatically copy to user's Downloads folder
    downloads_dir = r"C:\Users\akash\Downloads"
    if os.path.exists(downloads_dir):
        # With Names copy
        dest_with_names = os.path.join(downloads_dir, "LogicVerse_Presentation_With_Names.pptx")
        try:
            shutil.copy2(ppt_with_names, dest_with_names)
            print(f"[OK] Copied {os.path.basename(ppt_with_names)} to {downloads_dir}")
        except PermissionError:
            dest_alt = os.path.join(downloads_dir, "LogicVerse_Presentation_With_Names_Updated.pptx")
            shutil.copy2(ppt_with_names, dest_alt)
            print(f"[NOTE] Original was open in PowerPoint. Copied to {dest_alt}")

        # Without Names copy
        dest_without_names = os.path.join(downloads_dir, "LogicVerse_Presentation_Without_Names.pptx")
        try:
            shutil.copy2(ppt_without_names, dest_without_names)
            print(f"[OK] Copied {os.path.basename(ppt_without_names)} to {downloads_dir}")
        except PermissionError:
            dest_alt = os.path.join(downloads_dir, "LogicVerse_Presentation_Without_Names_Updated.pptx")
            shutil.copy2(ppt_without_names, dest_alt)
            print(f"[NOTE] Original was open in PowerPoint. Copied to {dest_alt}")
