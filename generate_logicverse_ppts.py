"""
LogicVerse Presentation Generator (Crimson Orbit Theme)
Generates 2 widescreen (16:9) presentations:
1. LogicVerse_Presentation_With_Names.pptx (Includes team names: Akash, Krishna, Sanskar, Ghansham, Hari)
2. LogicVerse_Presentation_Without_Names.pptx (Anonymous team roles)
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def build_presentation(with_names: bool, filename: str):
    prs = Presentation()
    prs.slide_width = Inches(13.333)  # 16:9 Widescreen
    prs.slide_height = Inches(7.5)

    # Crimson Orbit Color Palette
    BG_DARK = RGBColor(15, 18, 25)          # #0F1219 Dark Slate
    BG_CARD = RGBColor(25, 30, 42)          # #191E2A Navy Card
    BG_CARD_ALT = RGBColor(32, 38, 54)      # #202636 Highlight Card
    BORDER_CRIMSON = RGBColor(235, 60, 60)  # #EB3C3C Vibrant Crimson Red
    BORDER_GOLD = RGBColor(245, 158, 11)    # #F59E0B Warm Amber Gold
    BORDER_CYAN = RGBColor(56, 189, 248)    # #38BDF8 Sky Blue
    BORDER_GREEN = RGBColor(16, 185, 129)   # #10B981 Emerald Green
    BORDER_PURPLE = RGBColor(168, 85, 247)  # #A855F7 Purple Accent
    
    TEXT_WHITE = RGBColor(255, 255, 255)
    TEXT_MUTED = RGBColor(203, 213, 225)    # #CBD5E1 Light Slate
    TEXT_GOLD = RGBColor(252, 211, 77)      # #FCD34D Bright Gold
    TEXT_CYAN = RGBColor(186, 230, 253)     # #BAE6FD Light Cyan
    TEXT_CRIMSON = RGBColor(254, 202, 202)  # #FECACA Light Red

    blank_layout = prs.slide_layouts[6]

    def add_bg(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_DARK
        bg.line.fill.background()
        return bg

    def add_header(slide, title_text, category_text="LOGICVERSE • VISUAL COMPUTER SCIENCE IDE"):
        tb = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.73), Inches(1.1))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p1 = tf.paragraphs[0]
        p1.text = category_text.upper()
        p1.font.name = "Arial"
        p1.font.size = Pt(11)
        p1.font.bold = True
        p1.font.color.rgb = BORDER_CRIMSON

        p2 = tf.add_paragraph()
        p2.text = title_text
        p2.font.name = "Arial"
        p2.font.size = Pt(22)
        p2.font.bold = True
        p2.font.color.rgb = TEXT_WHITE
        p2.space_before = Pt(3)

        # Underline accent bar
        line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.48), Inches(11.73), Inches(0.04))
        line.fill.solid()
        line.fill.fore_color.rgb = BORDER_CRIMSON
        line.line.fill.background()

    def add_card(slide, left, top, width, height, border_color=BORDER_CRIMSON, bg_color=BG_CARD):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        card.line.color.rgb = border_color
        card.line.width = Pt(1.5)
        return card

    # =========================================================================
    # SLIDE 1: TITLE SLIDE
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    add_bg(s1)

    # Side accent bar
    side_bar = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.2), Inches(0.12), Inches(3.4))
    side_bar.fill.solid()
    side_bar.fill.fore_color.rgb = BORDER_CRIMSON
    side_bar.line.fill.background()

    tb1 = s1.shapes.add_textbox(Inches(1.1), Inches(1.1), Inches(11.4), Inches(3.5))
    tf1 = tb1.text_frame
    tf1.word_wrap = True

    p_badge = tf1.paragraphs[0]
    p_badge.text = "DISCRETE MATHEMATICS & THEORY OF COMPUTATION • CAPSTONE PROJECT"
    p_badge.font.name = "Arial"
    p_badge.font.size = Pt(11)
    p_badge.font.bold = True
    p_badge.font.color.rgb = BORDER_GOLD

    p_t = tf1.add_paragraph()
    p_t.text = "LogicVerse: An Interactive Visual IDE\nfor Discrete Math & Automata Theory"
    p_t.font.name = "Arial"
    p_t.font.size = Pt(28)
    p_t.font.bold = True
    p_t.font.color.rgb = TEXT_WHITE
    p_t.space_before = Pt(8)

    p_sub = tf1.add_paragraph()
    p_sub.text = "Build mathematical graphs on a canvas, simulate algorithms step-by-step, see live animated state transitions, and learn with an intelligent AI tutor."
    p_sub.font.name = "Calibri"
    p_sub.font.size = Pt(13)
    p_sub.font.color.rgb = TEXT_MUTED
    p_sub.space_before = Pt(8)

    # Team Card / Presentation Info Card
    card_t = add_card(s1, Inches(0.8), Inches(4.8), Inches(11.73), Inches(2.1), border_color=BORDER_CRIMSON)
    tf_t = card_t.text_frame
    tf_t.word_wrap = True
    tf_t.margin_left = Inches(0.4)
    tf_t.margin_top = Inches(0.3)

    pt1 = tf_t.paragraphs[0]
    pt1.text = "PROJECT OVERVIEW & TEAM CONTRIBUTORS" if with_names else "PROJECT OVERVIEW & PRESENTATION DETAILS"
    pt1.font.name = "Arial"
    pt1.font.size = Pt(12)
    pt1.font.bold = True
    pt1.font.color.rgb = TEXT_GOLD

    if with_names:
        pt2 = tf_t.add_paragraph()
        pt2.text = "• Team Lead & Automata/AI Lead: Akash (Finite Automata + LogicAI Tutor + Canvas IDE)"
        pt2.font.name = "Calibri"
        pt2.font.size = Pt(11.5)
        pt2.font.color.rgb = TEXT_WHITE
        pt2.space_before = Pt(4)

        pt3 = tf_t.add_paragraph()
        pt3.text = "• Core Domain Engineers: Sanskar, Ghansham, Hari (Set Theory, Logic Gates, Truth Tables, Proofs)"
        pt3.font.name = "Calibri"
        pt3.font.size = Pt(11.5)
        pt3.font.color.rgb = TEXT_MUTED

        pt4 = tf_t.add_paragraph()
        pt4.text = "• Relations & Order Theory Engineer: Krishna (Relation Matrix, Warshall's Algorithm, Hasse Diagrams)"
        pt4.font.name = "Calibri"
        pt4.font.size = Pt(11.5)
        pt4.font.color.rgb = TEXT_MUTED
    else:
        pt2 = tf_t.add_paragraph()
        pt2.text = "• Domain Scope: Set Theory, Propositional Logic, Relations & Functions, Finite Automata (DFA/NFA)"
        pt2.font.name = "Calibri"
        pt2.font.size = Pt(11.5)
        pt2.font.color.rgb = TEXT_WHITE
        pt2.space_before = Pt(4)

        pt3 = tf_t.add_paragraph()
        pt3.text = "• Key Technologies: Next.js, React Flow Interactive Canvas, TypeScript, Zustand, Google Gemini LLM"
        pt3.font.name = "Calibri"
        pt3.font.size = Pt(11.5)
        pt3.font.color.rgb = TEXT_MUTED

        pt4 = tf_t.add_paragraph()
        pt4.text = "• Focus: Replacing dry blackboard theory with live, step-by-step visual mathematical simulation."
        pt4.font.name = "Calibri"
        pt4.font.size = Pt(11.5)
        pt4.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 2: PROBLEM STATEMENT & SOLUTION
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    add_bg(s2)
    add_header(s2, "The Challenge in Learning Math & Our Visual Solution", "WHY WE BUILT LOGICVERSE")

    # Left Card: Problem
    card_prob = add_card(s2, Inches(0.8), Inches(1.8), Inches(5.7), Inches(5.1), border_color=BORDER_CRIMSON)
    tf_p = card_prob.text_frame
    tf_p.word_wrap = True
    tf_p.margin_left = tf_p.margin_right = Inches(0.35)
    tf_p.margin_top = Inches(0.3)

    p_ph = tf_p.paragraphs[0]
    p_ph.text = "THE PROBLEM: ABSTRACT & HARD TO SEE"
    p_ph.font.name = "Arial"
    p_ph.font.size = Pt(13)
    p_ph.font.bold = True
    p_ph.font.color.rgb = BORDER_CRIMSON

    prob_points = [
        ("Static Textbooks", "Students only read formulas on paper with no way to interact or test variations."),
        ("Invisible State Changes", "Tracing automata transitions (q0 -> q1) or Warshall's algorithm by hand causes mistakes."),
        ("No Step-by-Step Feedback", "When students get an answer wrong, textbook solutions do not explain the exact step where things went wrong."),
        ("Fragmented Tools", "Venn diagrams, truth tables, and state machines are taught in separate, disconnected apps."),
    ]
    for title, desc in prob_points:
        p = tf_p.add_paragraph()
        p.text = f"• {title}: {desc}"
        p.font.name = "Calibri"
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_MUTED
        p.space_before = Pt(8)

    # Right Card: Solution
    card_sol = add_card(s2, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.1), border_color=BORDER_CYAN)
    tf_s = card_sol.text_frame
    tf_s.word_wrap = True
    tf_s.margin_left = tf_s.margin_right = Inches(0.35)
    tf_s.margin_top = Inches(0.3)

    p_sh = tf_s.paragraphs[0]
    p_sh.text = "OUR SOLUTION: LOGICVERSE VISUAL IDE"
    p_sh.font.name = "Arial"
    p_sh.font.size = Pt(13)
    p_sh.font.bold = True
    p_sh.font.color.rgb = BORDER_CYAN

    sol_points = [
        ("Drag-and-Drop Canvas", "Students build mathematical sets, logic gates, and state machines like building blocks."),
        ("Live Glowing Simulation", "Watch states and arrows light up step-by-step as test strings are processed in real time."),
        ("Instant Formal Math", "Every visual graph automatically outputs Venn diagrams, truth tables, and formal LaTeX notation."),
        ("Built-in LogicAI Tutor", "An AI tutor that can see your canvas, explain your steps, and answer any discrete math question."),
    ]
    for title, desc in sol_points:
        p = tf_s.add_paragraph()
        p.text = f"• {title}: {desc}"
        p.font.name = "Calibri"
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_WHITE
        p.space_before = Pt(8)

    # =========================================================================
    # SLIDE 3: SYSTEM ARCHITECTURE & DATA FLOW
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    add_bg(s3)
    add_header(s3, "System Architecture: From Visual Canvas to Mathematical Solvers", "HOW LOGICVERSE WORKS")

    arch_steps = [
        ("1. Visual Canvas Layer", "React Flow DAG Engine", "User drags states, sets, or logic gates and connects them with animated arrows on screen.", BORDER_CYAN),
        ("2. Graph Parser & Store", "Zustand State Manager", "Extracts nodes, edges, and symbols into clean mathematical models in milliseconds.", BORDER_GOLD),
        ("3. Mathematical Solvers", "Algorithmic Engine", "Runs DFA simulation, Hopcroft minimization, Warshall's algorithm, and truth tables.", BORDER_CRIMSON),
        ("4. Visual Output Panels", "Interactive Dock Views", "Displays dynamic Venn diagrams, step logs, test suite badges, and matrix tables.", BORDER_GREEN),
        ("5. LogicAI Tutor", "Live LLM + Local AST", "Reads live canvas state and gives step-by-step explanations via Gemini API or local rules.", BORDER_PURPLE),
    ]

    card_w = Inches(2.18)
    card_h = Inches(5.1)
    for i, (layer_title, tech_sub, body_text, accent_col) in enumerate(arch_steps):
        left_pos = Inches(0.8 + i * 2.4)
        c = add_card(s3, left_pos, Inches(1.8), card_w, card_h, border_color=accent_col)
        tframe = c.text_frame
        tframe.word_wrap = True
        tframe.margin_left = tframe.margin_right = Inches(0.18)
        tframe.margin_top = Inches(0.25)

        p1 = tframe.paragraphs[0]
        p1.text = layer_title
        p1.font.name = "Arial"
        p1.font.size = Pt(11.5)
        p1.font.bold = True
        p1.font.color.rgb = accent_col

        p2 = tframe.add_paragraph()
        p2.text = tech_sub
        p2.font.name = "Arial"
        p2.font.size = Pt(10)
        p2.font.bold = True
        p2.font.color.rgb = TEXT_WHITE
        p2.space_before = Pt(4)

        p3 = tframe.add_paragraph()
        p3.text = body_text
        p3.font.name = "Calibri"
        p3.font.size = Pt(10.5)
        p3.font.color.rgb = TEXT_MUTED
        p3.space_before = Pt(10)

    # =========================================================================
    # SLIDE 4: TECHNOLOGY STACK
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    add_bg(s4)
    add_header(s4, "Modern Tech Stack Built for Performance and Speed", "TECHNOLOGY CHOICES")

    tech_cards = [
        ("Next.js 16 & React 19", "Modern Web Framework", "Provides server-side rendering, App Router, and lightning-fast page loading with zero lag.", BORDER_CYAN),
        ("React Flow Canvas", "Graph Visualization Engine", "Renders custom double-ring accept states, glowing nodes, and animated transition lines seamlessly.", BORDER_GOLD),
        ("Zustand State Store", "Centralized State", "Ensures immediate canvas re-computation so every click or connection updates tables instantly.", BORDER_GREEN),
        ("TypeScript & Vitest", "Type Safety & Testing", "Strict typing across all math formulas with 51 automated unit tests verifying algorithm correctness.", BORDER_CRIMSON),
        ("Google Gemini & LLMs", "AI Reasoning Engine", "Connects LogicAI to frontier language models with live canvas state injected into prompts.", BORDER_PURPLE),
        ("Tailwind CSS", "Premium Dark Mode Theme", "Custom dark UI with glassmorphism, responsive panels, and smooth micro-animations.", BORDER_CYAN),
    ]

    for i, (title, sub, body, col) in enumerate(tech_cards):
        col_idx = i % 3
        row_idx = i // 3
        c_left = Inches(0.8 + col_idx * 4.0)
        c_top = Inches(1.8 + row_idx * 2.6)
        c = add_card(s4, c_left, c_top, Inches(3.73), Inches(2.35), border_color=col)
        tf = c.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = Inches(0.25)
        tf.margin_top = Inches(0.2)

        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.name = "Arial"
        p1.font.size = Pt(12)
        p1.font.bold = True
        p1.font.color.rgb = col

        p2 = tf.add_paragraph()
        p2.text = sub
        p2.font.name = "Arial"
        p2.font.size = Pt(10)
        p2.font.color.rgb = TEXT_GOLD
        p2.space_before = Pt(2)

        p3 = tf.add_paragraph()
        p3.text = body
        p3.font.name = "Calibri"
        p3.font.size = Pt(10.5)
        p3.font.color.rgb = TEXT_MUTED
        p3.space_before = Pt(6)

    # =========================================================================
    # SLIDE 5: MODULE 1 — SET THEORY & VENN DIAGRAMS
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    add_bg(s5)
    owner_str = " (Engineered by Sanskar)" if with_names else ""
    add_header(s5, f"Module 1: Set Theory & Dynamic Venn Diagrams{owner_str}", "FOUNDATIONS OF DISCRETE MATH")

    c1 = add_card(s5, Inches(0.8), Inches(1.8), Inches(5.7), Inches(5.1), border_color=BORDER_CYAN)
    tf1 = c1.text_frame
    tf1.word_wrap = True
    tf1.margin_left = tf1.margin_right = Inches(0.35)
    tf1.margin_top = Inches(0.3)

    p = tf1.paragraphs[0]
    p.text = "SET OPERATIONS ON CANVAS"
    p.font.name = "Arial"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = BORDER_CYAN

    items1 = [
        ("Visual Set Builder", "Create sets like A = {1, 2, 3} and B = {3, 4, 5} with customizable colors."),
        ("Full Operation Suite", "Connect sets into Union (A ∪ B), Intersection (A ∩ B), and Difference (A - B)."),
        ("Advanced Operations", "Compute Symmetric Difference (A ⊕ B), Cartesian Product (A × B), and Power Set P(A)."),
        ("Live Cardinality Output", "Instantly see size calculations |A ∪ B| and automatic duplicate element removal."),
    ]
    for t, d in items1:
        p = tf1.add_paragraph()
        p.text = f"• {t}: {d}"
        p.font.name = "Calibri"
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_WHITE
        p.space_before = Pt(8)

    c2 = add_card(s5, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.1), border_color=BORDER_GOLD)
    tf2 = c2.text_frame
    tf2.word_wrap = True
    tf2.margin_left = tf2.margin_right = Inches(0.35)
    tf2.margin_top = Inches(0.3)

    p = tf2.paragraphs[0]
    p.text = "DYNAMIC SVG VENN DIAGRAMS"
    p.font.name = "Arial"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = BORDER_GOLD

    items2 = [
        ("2-Set & 3-Set Support", "Switch seamlessly between 2-circle and 3-circle mathematical Venn diagrams."),
        ("8-Region Partitioning", "Elements are automatically sorted into their exact mathematical intersection zones."),
        ("Active Region Glow", "The region matching your active operation lights up with a colorful visual glow."),
        ("Roster Notation", "Displays clean bracket notation like {1, 2, 4, 5} alongside diagram graphics."),
    ]
    for t, d in items2:
        p = tf2.add_paragraph()
        p.text = f"• {t}: {d}"
        p.font.name = "Calibri"
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_MUTED
        p.space_before = Pt(8)

    # =========================================================================
    # SLIDE 6: MODULE 2 — PROPOSITIONAL LOGIC & TRUTH TABLES
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    add_bg(s6)
    owner_str = " (Engineered by Ghansham)" if with_names else ""
    add_header(s6, f"Module 2: Propositional Logic & Truth Tables{owner_str}", "FORMAL LOGIC & VERIFICATION")

    c1 = add_card(s6, Inches(0.8), Inches(1.8), Inches(5.7), Inches(5.1), border_color=BORDER_PURPLE)
    tf1 = c1.text_frame
    tf1.word_wrap = True
    tf1.margin_left = tf1.margin_right = Inches(0.35)
    tf1.margin_top = Inches(0.3)

    p = tf1.paragraphs[0]
    p.text = "LOGIC GATES CANVAS"
    p.font.name = "Arial"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = BORDER_PURPLE

    items1 = [
        ("Proposition Variables", "Place boolean inputs P, Q, R with simple True / False clickable toggle buttons."),
        ("Standard Logic Gates", "Connect variables through AND (∧), OR (∨), NOT (¬), IMPLIES (→), and IFF (↔)."),
        ("Live Value Propagation", "Toggle any variable and watch True/False values travel through the gates immediately."),
        ("Formula Synthesizer", "Automatically generates standard mathematical Well-Formed Formulas (WFF)."),
    ]
    for t, d in items1:
        p = tf1.add_paragraph()
        p.text = f"• {t}: {d}"
        p.font.name = "Calibri"
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_WHITE
        p.space_before = Pt(8)

    c2 = add_card(s6, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.1), border_color=BORDER_GREEN)
    tf2 = c2.text_frame
    tf2.word_wrap = True
    tf2.margin_left = tf2.margin_right = Inches(0.35)
    tf2.margin_top = Inches(0.3)

    p = tf2.paragraphs[0]
    p.text = "TRUTH TABLES & FORMAL PROOFS"
    p.font.name = "Arial"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = BORDER_GREEN

    items2 = [
        ("Full Truth Tables", "Generates complete 2^n interpretation tables showing every combination of T and F."),
        ("Canonical DNF & CNF", "Automatically calculates Disjunctive and Conjunctive Normal Forms for the formula."),
        ("Tautology Checker", "Instantly verifies if an expression is always True (Tautology) or always False (Contradiction)."),
        ("Counter-Example Finder", "If a theorem is invalid, it highlights the exact variable assignment that breaks it."),
    ]
    for t, d in items2:
        p = tf2.add_paragraph()
        p.text = f"• {t}: {d}"
        p.font.name = "Calibri"
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_MUTED
        p.space_before = Pt(8)

    # =========================================================================
    # SLIDE 7: MODULE 3 — MATHEMATICAL PROOF SOLVERS
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    add_bg(s7)
    owner_str = " (Engineered by Hari)" if with_names else ""
    add_header(s7, f"Module 3: Step-by-Step Mathematical Proof Solvers{owner_str}", "ADVANCED THEORETICAL TOOLS")

    c1 = add_card(s7, Inches(0.8), Inches(1.8), Inches(3.73), Inches(5.1), border_color=BORDER_GOLD)
    tf1 = c1.text_frame
    tf1.word_wrap = True
    tf1.margin_left = tf1.margin_right = Inches(0.25)
    tf1.margin_top = Inches(0.3)

    p = tf1.paragraphs[0]
    p.text = "INCLUSION-EXCLUSION (PIE)"
    p.font.name = "Arial"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = BORDER_GOLD

    p_body1 = [
        ("Step-by-step arithmetic", "Solves survey and counting problems with 2 and 3 sets."),
        ("Formula breakdown", "Shows |A ∪ B| = |A| + |B| - |A ∩ B| step-by-step."),
        ("Real-world presets", "Includes sample problems (sports, languages, courses)."),
    ]
    for t, d in p_body1:
        p = tf1.add_paragraph()
        p.text = f"• {t}: {d}"
        p.font.name = "Calibri"
        p.font.size = Pt(10.5)
        p.font.color.rgb = TEXT_MUTED
        p.space_before = Pt(8)

    c2 = add_card(s7, Inches(4.8), Inches(1.8), Inches(3.73), Inches(5.1), border_color=BORDER_CYAN)
    tf2 = c2.text_frame
    tf2.word_wrap = True
    tf2.margin_left = tf2.margin_right = Inches(0.25)
    tf2.margin_top = Inches(0.3)

    p = tf2.paragraphs[0]
    p.text = "CANTOR'S DIAGONALIZATION"
    p.font.name = "Arial"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = BORDER_CYAN

    p_body2 = [
        ("Uncountability of Real Numbers", "Proves why real numbers cannot be listed in a 1-to-1 list with integers."),
        ("Live Anti-Diagonal", "Inverts the diagonal digits to construct a new number not in the list."),
        ("Cantor's Snake Path", "Visualizes positive rationals Q+ demonstrating countability."),
    ]
    for t, d in p_body2:
        p = tf2.add_paragraph()
        p.text = f"• {t}: {d}"
        p.font.name = "Calibri"
        p.font.size = Pt(10.5)
        p.font.color.rgb = TEXT_WHITE
        p.space_before = Pt(8)

    c3 = add_card(s7, Inches(8.8), Inches(1.8), Inches(3.73), Inches(5.1), border_color=BORDER_CRIMSON)
    tf3 = c3.text_frame
    tf3.word_wrap = True
    tf3.margin_left = tf3.margin_right = Inches(0.25)
    tf3.margin_top = Inches(0.3)

    p = tf3.paragraphs[0]
    p.text = "MATHEMATICAL INDUCTION"
    p.font.name = "Arial"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = BORDER_CRIMSON

    p_body3 = [
        ("Theorem Derivations", "Interactive step-by-step derivations for summation theorems (e.g. 1+2+...+n)."),
        ("3-Stage Structure", "Breaks down Base Step P(1), Inductive Hypothesis P(k), and Inductive Step P(k+1)."),
        ("Visual Verification", "Validates step logic so students learn how to structure mathematical proofs."),
    ]
    for t, d in p_body3:
        p = tf3.add_paragraph()
        p.text = f"• {t}: {d}"
        p.font.name = "Calibri"
        p.font.size = Pt(10.5)
        p.font.color.rgb = TEXT_MUTED
        p.space_before = Pt(8)

    # =========================================================================
    # SLIDE 8: MODULE 4 — RELATIONS & FUNCTIONS
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    add_bg(s8)
    owner_str = " (Engineered by Krishna)" if with_names else ""
    add_header(s8, f"Module 4: Relations, Order Theory & Functions{owner_str}", "ALGEBRAIC SYSTEMS & STRUCTURES")

    c1 = add_card(s8, Inches(0.8), Inches(1.8), Inches(5.7), Inches(5.1), border_color=BORDER_GOLD)
    tf1 = c1.text_frame
    tf1.word_wrap = True
    tf1.margin_left = tf1.margin_right = Inches(0.35)
    tf1.margin_top = Inches(0.3)

    p = tf1.paragraphs[0]
    p.text = "RELATION MATRIX & PROPERTIES"
    p.font.name = "Arial"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = BORDER_GOLD

    r_items1 = [
        ("Interactive Matrix Grid", "Click grid cells to toggle pairs (a, b) on a finite set A = {1, 2, 3, 4}."),
        ("Instant Property Checking", "Real-time verification of Reflexive, Symmetric, Transitive, and Anti-symmetric properties."),
        ("Equivalence Relations", "Highlights when a relation forms equivalence classes [a] and partitions the set."),
        ("Warshall's Algorithm", "Step-by-step matrix derivation computing Transitive Closure R+ in O(n^3) operations."),
    ]
    for t, d in r_items1:
        p = tf1.add_paragraph()
        p.text = f"• {t}: {d}"
        p.font.name = "Calibri"
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_WHITE
        p.space_before = Pt(8)

    c2 = add_card(s8, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.1), border_color=BORDER_PURPLE)
    tf2 = c2.text_frame
    tf2.word_wrap = True
    tf2.margin_left = tf2.margin_right = Inches(0.35)
    tf2.margin_top = Inches(0.3)

    p = tf2.paragraphs[0]
    p.text = "HASSE DIAGRAMS & FUNCTIONS"
    p.font.name = "Arial"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = BORDER_PURPLE

    r_items2 = [
        ("Hasse Diagrams for Posets", "Draws clean order hierarchy trees by stripping redundant self-loops and transitive edges."),
        ("Lattice & Bound Detection", "Identifies maximal/minimal elements, bounds, and partial order structures."),
        ("Function Mapping Analyzer", "Visual arrow diagrams connecting domain elements to codomain targets."),
        ("Function Types", "Automatically classifies mappings as Injective (one-to-one), Surjective (onto), or Bijective."),
    ]
    for t, d in r_items2:
        p = tf2.add_paragraph()
        p.text = f"• {t}: {d}"
        p.font.name = "Calibri"
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_MUTED
        p.space_before = Pt(8)

    # =========================================================================
    # SLIDE 9: MODULE 5 — FINITE AUTOMATA (DFA / NFA)
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    add_bg(s9)
    owner_str = " (Engineered by Akash)" if with_names else ""
    add_header(s9, f"Module 5: Finite Automata (DFA / NFA) Visualizer{owner_str}", "AUTOMATA THEORY & STATE MACHINES")

    c1 = add_card(s9, Inches(0.8), Inches(1.8), Inches(5.7), Inches(5.1), border_color=BORDER_CYAN)
    tf1 = c1.text_frame
    tf1.word_wrap = True
    tf1.margin_left = tf1.margin_right = Inches(0.35)
    tf1.margin_top = Inches(0.3)

    p = tf1.paragraphs[0]
    p.text = "STATE GRAPH CANVAS & SIMULATION"
    p.font.name = "Arial"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = BORDER_CYAN

    a_items1 = [
        ("Custom Circular States", "Add states q0, q1 with start arrow (→q0) and concentric double-rings for accept states."),
        ("Glowing Step Playback", "Type an input string (e.g. '101') and watch active states glow with animated pulse rings."),
        ("Active Edge Highlighting", "Transition arrows light up with a drop-shadow glow as characters are consumed."),
        ("Batch Test Suite", "Test multiple strings simultaneously with green ACCEPTED and red REJECTED badges."),
    ]
    for t, d in a_items1:
        p = tf1.add_paragraph()
        p.text = f"• {t}: {d}"
        p.font.name = "Calibri"
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_WHITE
        p.space_before = Pt(8)

    c2 = add_card(s9, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.1), border_color=BORDER_CRIMSON)
    tf2 = c2.text_frame
    tf2.word_wrap = True
    tf2.margin_left = tf2.margin_right = Inches(0.35)
    tf2.margin_top = Inches(0.3)

    p = tf2.paragraphs[0]
    p.text = "CONVERSION & MINIMIZATION SOLVERS"
    p.font.name = "Arial"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = BORDER_CRIMSON

    a_items2 = [
        ("NFA → DFA Subset Construction", "Calculates ε-closures and powerset tables with 1-click 'Load Converted DFA to Canvas'."),
        ("Hopcroft DFA Minimization", "Runs partition refinement (0-equiv, 1-equiv) and builds the Distinguishability Matrix."),
        ("1-Click Minimal Graph", "Instantly merges redundant states and renders the minimal equivalent DFA on screen."),
        ("Moore ⇄ Mealy Transducers", "Simulates state-output vs edge-output machines with cumulative output sequences."),
    ]
    for t, d in a_items2:
        p = tf2.add_paragraph()
        p.text = f"• {t}: {d}"
        p.font.name = "Calibri"
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_MUTED
        p.space_before = Pt(8)

    # =========================================================================
    # SLIDE 10: INTELLIGENT LOGICAI CHATBOT
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    add_bg(s10)
    owner_str = " (Engineered by Akash)" if with_names else ""
    add_header(s10, f"LogicAI: Context-Aware Mathematical Tutor{owner_str}", "INTELLIGENT AI TUTORING")

    c1 = add_card(s10, Inches(0.8), Inches(1.8), Inches(5.7), Inches(5.1), border_color=BORDER_PURPLE)
    tf1 = c1.text_frame
    tf1.word_wrap = True
    tf1.margin_left = tf1.margin_right = Inches(0.35)
    tf1.margin_top = Inches(0.3)

    p = tf1.paragraphs[0]
    p.text = "LIVE CANVAS CONTEXT INJECTION"
    p.font.name = "Arial"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = BORDER_PURPLE

    ai_items1 = [
        ("Direct Canvas Visibility", "LogicAI actually sees what is on your screen: active states, gate inputs, sets, and formulas."),
        ("Step-by-Step Explanations", "Click 'Explain this step' to learn exactly why state q0 moved to q1 on reading symbol '0'."),
        ("Diagnostic Feedback", "Detects disconnected handles, duplicate elements, or invalid transitions and suggests remedies."),
        ("Quick-Action Buttons", "One-click chips for 'Explain this step', 'Generate example', and 'Give me a hint'."),
    ]
    for t, d in ai_items1:
        p = tf1.add_paragraph()
        p.text = f"• {t}: {d}"
        p.font.name = "Calibri"
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_WHITE
        p.space_before = Pt(8)

    c2 = add_card(s10, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.1), border_color=BORDER_CYAN)
    tf2 = c2.text_frame
    tf2.word_wrap = True
    tf2.margin_left = tf2.margin_right = Inches(0.35)
    tf2.margin_top = Inches(0.3)

    p = tf2.paragraphs[0]
    p.text = "HYBRID LLM + LOCAL ENGINE ARCHITECTURE"
    p.font.name = "Arial"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = BORDER_CYAN

    ai_items2 = [
        ("Next.js /api/chat Route", "Server route connecting LogicAI directly to Google Gemini and OpenAI models."),
        ("In-App Settings Modal", "Students can connect their own free Gemini or Groq API key directly in the UI."),
        ("Answers ANY Question", "With live LLM connected, answers open-ended questions across all computer science theory."),
        ("Zero-Crash Offline Fallback", "If no key or internet is available, falls back to local mathematical AST rules smoothly."),
    ]
    for t, d in ai_items2:
        p = tf2.add_paragraph()
        p.text = f"• {t}: {d}"
        p.font.name = "Calibri"
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_MUTED
        p.space_before = Pt(8)

    # =========================================================================
    # SLIDE 11: INDIVIDUAL CONTRIBUTIONS / TEAM BREAKDOWN
    # =========================================================================
    s11 = prs.slides.add_slide(blank_layout)
    add_bg(s11)
    add_header(s11, "Team Roles and Individual Contribution Breakdown", "PROJECT EXECUTION & OWNERSHIP")

    members = [
        ("Akash", "Team Lead & System Architect", "Finite Automata (DFA/NFA simulator, NFA->DFA, Minimization) + LogicAI Chatbot (LLM integration & context) + Frontend Shell.", BORDER_CYAN),
        ("Sanskar", "Set Theory & Venn Specialist", "Core Set Operations (Union, Intersection, Difference, Power Set) + Dynamic 2-Set & 3-Set SVG Venn Diagram partitioning.", BORDER_GOLD),
        ("Ghansham", "Propositional Logic Specialist", "Logic Gate DAG Canvas (AND, OR, NOT, IMPLIES) + 16-variable Truth Table generator + DNF/CNF canonical forms & Tautology checker.", BORDER_GREEN),
        ("Hari", "Proof & Verification Specialist", "Principle of Inclusion-Exclusion (PIE) Solver + Cantor's Diagonalization proof visualizer + Mathematical Induction steps.", BORDER_PURPLE),
        ("Krishna", "Relations & Order Theory Specialist", "Binary Relation Matrix (Reflexive/Symmetric/Transitive) + Warshall's Algorithm transitive closure + Hasse Diagrams & Function Mapper.", BORDER_CRIMSON),
    ] if with_names else [
        ("Team Member 1", "Lead Architect & Automata Engineer", "Finite Automata (DFA/NFA simulator, NFA->DFA, Minimization) + LogicAI Chatbot (LLM integration & context) + Frontend Shell.", BORDER_CYAN),
        ("Team Member 2", "Set Theory & Venn Specialist", "Core Set Operations (Union, Intersection, Difference, Power Set) + Dynamic 2-Set & 3-Set SVG Venn Diagram partitioning.", BORDER_GOLD),
        ("Team Member 3", "Propositional Logic Specialist", "Logic Gate DAG Canvas (AND, OR, NOT, IMPLIES) + 16-variable Truth Table generator + DNF/CNF canonical forms & Tautology checker.", BORDER_GREEN),
        ("Team Member 4", "Proof & Verification Specialist", "Principle of Inclusion-Exclusion (PIE) Solver + Cantor's Diagonalization proof visualizer + Mathematical Induction steps.", BORDER_PURPLE),
        ("Team Member 5", "Relations & Order Theory Specialist", "Binary Relation Matrix (Reflexive/Symmetric/Transitive) + Warshall's Algorithm transitive closure + Hasse Diagrams & Function Mapper.", BORDER_CRIMSON),
    ]

    card_w = Inches(2.18)
    card_h = Inches(5.1)
    for i, (m_name, m_role, m_desc, m_col) in enumerate(members):
        left_pos = Inches(0.8 + i * 2.4)
        c = add_card(s11, left_pos, Inches(1.8), card_w, card_h, border_color=m_col)
        tframe = c.text_frame
        tframe.word_wrap = True
        tframe.margin_left = tframe.margin_right = Inches(0.18)
        tframe.margin_top = Inches(0.25)

        p1 = tframe.paragraphs[0]
        p1.text = m_name
        p1.font.name = "Arial"
        p1.font.size = Pt(13)
        p1.font.bold = True
        p1.font.color.rgb = m_col

        p2 = tframe.add_paragraph()
        p2.text = m_role
        p2.font.name = "Arial"
        p2.font.size = Pt(9.5)
        p2.font.bold = True
        p2.font.color.rgb = TEXT_WHITE
        p2.space_before = Pt(3)

        p3 = tframe.add_paragraph()
        p3.text = m_desc
        p3.font.name = "Calibri"
        p3.font.size = Pt(10.5)
        p3.font.color.rgb = TEXT_MUTED
        p3.space_before = Pt(10)

    # =========================================================================
    # SLIDE 12: FUTURE SCOPE & ROADMAP
    # =========================================================================
    s12 = prs.slides.add_slide(blank_layout)
    add_bg(s12)
    add_header(s12, "Future Roadmap: Context-Free Grammars & Turing Machines", "UPCOMING EXPANSIONS")

    c1 = add_card(s12, Inches(0.8), Inches(1.8), Inches(5.7), Inches(5.1), border_color=BORDER_GOLD)
    tf1 = c1.text_frame
    tf1.word_wrap = True
    tf1.margin_left = tf1.margin_right = Inches(0.35)
    tf1.margin_top = Inches(0.3)

    p = tf1.paragraphs[0]
    p.text = "MODULE 6: CONTEXT-FREE GRAMMAR (CFG) [NEXT PHASE]"
    p.font.name = "Arial"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = BORDER_GOLD

    f_items1 = [
        ("Grammar Rule Builder", "Interactive UI to define production rules like S -> aSb | ε."),
        ("Dynamic Parse Trees", "Visual hierarchical syntax tree generation showing string derivations."),
        ("Chomsky Normal Form (CNF)", "Automated 4-step converter eliminating ε-rules and unit rules."),
        ("CYK Parsing Algorithm", "Dynamic programming triangular parsing table in O(n^3) time."),
    ]
    for t, d in f_items1:
        p = tf1.add_paragraph()
        p.text = f"• {t}: {d}"
        p.font.name = "Calibri"
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_MUTED
        p.space_before = Pt(8)

    c2 = add_card(s12, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.1), border_color=BORDER_PURPLE)
    tf2 = c2.text_frame
    tf2.word_wrap = True
    tf2.margin_left = tf2.margin_right = Inches(0.35)
    tf2.margin_top = Inches(0.3)

    p = tf2.paragraphs[0]
    p.text = "MODULE 7: PDA & TURING MACHINES [NEXT PHASE]"
    p.font.name = "Arial"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = BORDER_PURPLE

    f_items2 = [
        ("Pushdown Automata (PDA)", "Interactive LIFO stack animator showing push and pop transitions."),
        ("Acceptance Criteria", "Visualize acceptance by Final State vs Empty Stack."),
        ("Turing Machine Infinite Tape", "Interactive 2-way tape with head movements (Left, Right, Stay)."),
        ("Halting Problem Proofs", "Visual explanations of computability limits and undecidable languages."),
    ]
    for t, d in f_items2:
        p = tf2.add_paragraph()
        p.text = f"• {t}: {d}"
        p.font.name = "Calibri"
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_MUTED
        p.space_before = Pt(8)

    # =========================================================================
    # SLIDE 13: CONCLUSION & PROJECT IMPACT
    # =========================================================================
    s13 = prs.slides.add_slide(blank_layout)
    add_bg(s13)
    add_header(s13, "Conclusion: Making Computer Science Theory Tangible", "SUMMARY & IMPACT")

    card_concl = add_card(s13, Inches(0.8), Inches(1.8), Inches(11.73), Inches(5.1), border_color=BORDER_GREEN)
    tf_c = card_concl.text_frame
    tf_c.word_wrap = True
    tf_c.margin_left = tf_c.margin_right = Inches(0.45)
    tf_c.margin_top = Inches(0.4)

    p = tf_c.paragraphs[0]
    p.text = "LOGICVERSE IMPACT SUMMARY"
    p.font.name = "Arial"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = BORDER_GREEN

    concl_points = [
        ("Replaces Static Textbooks with Interactive Simulation", "Students learn math by building graphs, testing strings, and watching state transitions live."),
        ("5 Core Disciplines Fully Operational", "Set Theory, Propositional Logic, Proof Solvers, Relations/Functions, and Finite Automata working with 51 passing automated tests."),
        ("Real AI Context Integration", "LogicAI is not a generic chatbot; it has direct visibility into canvas nodes and gives personalized pedagogical guidance."),
        ("Production Quality Engineering", "Built on Next.js 16, React Flow, TypeScript, and Tailwind CSS with instant load times and zero compilation errors."),
    ]
    for title, desc in concl_points:
        p = tf_c.add_paragraph()
        p.text = f"✓  {title}: {desc}"
        p.font.name = "Calibri"
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_WHITE
        p.space_before = Pt(12)

    p_end = tf_c.add_paragraph()
    p_end.text = "Thank You! • Open for Live Demonstration & Questions"
    p_end.font.name = "Arial"
    p_end.font.size = Pt(13)
    p_end.font.bold = True
    p_end.font.color.rgb = TEXT_GOLD
    p_end.space_before = Pt(20)

    # Save presentation
    prs.save(filename)
    print(f"[OK] Generated: {filename}")

if __name__ == "__main__":
    out_dir = r"c:\logicverse-v0.1-foundation"
    ppt_with_names = os.path.join(out_dir, "LogicVerse_Presentation_With_Names.pptx")
    ppt_without_names = os.path.join(out_dir, "LogicVerse_Presentation_Without_Names.pptx")
    
    build_presentation(with_names=True, filename=ppt_with_names)
    build_presentation(with_names=False, filename=ppt_without_names)
