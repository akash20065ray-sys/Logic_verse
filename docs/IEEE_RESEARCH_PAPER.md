# LogicVerse: A Reactive Visual Graph IDE and Dual-Engine Grounded AI Tutor for Discrete Mathematics and Formal Languages

**Akash Sharma**  
Department of Computer Science and Engineering  
Graphic Era Deemed to be University, Dehradun, India  
`akash.sharma.cse@geu.ac.in`  

**Faculty Mentor / Co-Author**  
School of Computing and Informatics  
Graphic Era Deemed to be University, Dehradun, India  
`research.computing@geu.ac.in`  

---

### Abstract
Undergraduate curricula require students to master abstract discrete mathematics (sets, propositions, relations, posets) alongside formal automata. In practice, students struggle because existing instructional tools are fragmented across single-topic desktop utilities, while commercial Large Language Models (LLMs) hallucinate arithmetic bounds, invert state transitions, and produce broken LaTeX code. This paper presents *LogicVerse*, a browser-native visual computing IDE and dual-engine intelligent tutoring system uniting discrete mathematics and formal language automata. LogicVerse incorporates a client-side topological Directed Acyclic Graph (DAG) compilation engine delivering sub-millisecond evaluation (< 3.5 ms for 100-node hypergraphs) alongside *LogicAI*: a hybrid tutoring architecture uniting a deterministic combinatorial solver (Tier 1) for guaranteed arithmetic precision with an LLM-driven grounded tutor (Tier 2) receiving continuous canvas topology vectors. In a quantitative benchmark of 100 discrete counting problems, LogicVerse achieved 100.0% precision and 0.0% hallucination vs. 86.0% for GPT-4o and 82.5% for Gemini 1.5. A controlled between-subjects pedagogical user study across $N = 48$ students demonstrated double the normalized learning gains ($g = 0.68$ vs. $0.34$, $p < 0.001$, Cohen's $d = 1.42$), an "Excellent" System Usability Scale score (SUS = $86.4 \pm 7.2$), and significant reductions in cognitive workload ($-50.1\%$ mental demand, $-63.3\%$ frustration via NASA-TLX).

**Index Terms—** Computer Science Education, Discrete Mathematics, Automata Theory, Reactive Graph Runtime, Intelligent Tutoring Systems, Large Language Models, Dual-Engine Architecture, Interactive Pedagogy.

---

## I. Introduction
Discrete mathematics and formal automata theory provide the foundational analytical methods required across computer science curricula. These topics directly govern compiler construction, relational query optimization, cryptographic protocol verification, and complexity analysis [1], [2]. Despite their importance, undergraduate students consistently face difficulties connecting abstract algebraic definitions with concrete operational models.

In classical classrooms, students write set-builder notations, trace truth tables by hand, construct adjacency matrices, and sketch state transitions on paper. When analytical intuition fails, static textbook answer keys provide the final result but omit the intermediate evaluation sequence, boundary invariants, and structural edge cases [3], [4].

Educational technology researchers have developed graphical simulators for specific sub-fields. JFLAP [1] models formal languages and automata, Logisim [2] simulates digital logic circuits, and Automata Tutor [5] automates state machine grading. As summarized in Table I, these systems operate in isolation: students must switch between disconnected tools with conflicting interfaces, proprietary file formats, and no conceptual bridges between set operations and state transition functions.

Generative artificial intelligence has introduced commercial Large Language Models (LLMs) such as ChatGPT-4o [16] and Gemini 1.5 [17] into homework workflows. However, empirical studies reveal that autoregressive models fail on discrete mathematics and formal language inquiries [3], [4]. Because they predict next tokens probabilistically, LLMs exhibit cascading arithmetic errors on combinatorial formulas, reverse transition directions in $\epsilon$-NFA conversions, invent non-existent state paths, and output raw unrendered LaTeX markup (such as `\frac{a}{b}` and unescaped `$` delimiters) that confuse students.

To address these challenges, we built **LogicVerse**: an open-source visual computing IDE and grounded intelligent tutor. LogicVerse unifies five curricular modules: (i) Set Theory & Venn Cardinality, (ii) Propositional Logic & Truth Valuations, (iii) Binary Relations & Poset Hasse Lattices, (iv) Finite Automata & Regular Languages, and (v) Context-Free Grammars, CYK Parsing, & Turing Computability. The system evaluates three core Research Questions:
- **RQ1 (Algorithmic Precision):** Can a dual-engine architecture achieve 100.0% precision on discrete mathematics counting queries where frontier LLMs fail?
- **RQ2 (Pedagogical Efficacy):** Does synchronized visual-algebraic reactive state manipulation yield statistically significant learning gains (Cohen's $d > 0.8$) over conventional instruction?
- **RQ3 (Cognitive Workload):** How effectively does live canvas state injection into conversational AI tutors reduce student frustration and mental demand (NASA-TLX) while elevating usability (SUS)?

---

## II. Related Work and Critical Gaps

### A. Visual Simulators in Computer Science Pedagogy
Visual interactive representations serve as effective cognitive scaffolds in computing education [1], [2]. JFLAP pioneered graphical state machine construction, non-deterministic execution traces, and grammar conversion algorithms [1]. Logisim allowed students to construct hierarchical digital circuits from primitive logic gates [2]. Automata Tutor v3 added automated problem verification and counterexample generation using formal SMT solvers [5]. However, as shown in Table I, these systems operate in isolation: none provide a shared computational model spanning set operations, boolean propositions, binary relations, and automata transitions. When students advance from discrete structures to automata, they must switch between incompatible software environments that share no common data structures or interaction models.

### TABLE I: Comparative Taxonomy of Instructional Platforms
| Platform / System | Domain Scope | Execution Substrate | Reactive Multi-Dock | AI Tutor Integration | Arithmetic Guarantee |
| :--- | :---: | :---: | :---: | :---: | :---: |
| JFLAP [1] (Rodger et al.) | Automata & Grammars Only | Desktop Java Applet | No (Single-view) | None | N/A (No counting engine) |
| Logisim [2] (Burch) | Digital Logic Circuits Only | Desktop Java / C++ | No (Single schematic) | None | N/A (Gate delays only) |
| Automata Tutor v3 [5] | Automata Grading Only | Web Application | No (Problem-specific) | Static SMT Solver | Equivalence checks only |
| Standalone LLMs [16], [17] | Broad Language Corpus | Cloud LLM API | None (Text-only prompt) | Full Conversational | No (14.0%–17.5% failure) |
| **LogicVerse (Proposed)** | **Unified (Sets, Logic, Relations, Automata, CFG, Turing)** | **Browser Client-Side DAG** | **Yes (Synchronized 4-Dock)** | **LogicAI Dual-Engine** | **Yes (100.0% Exact Tier 1)** |

### B. LLMs in STEM and Cascading Mathematical Hallucinations
Empirical analyses by Alqasemi et al. [3] and Kumar & Meusel [4] demonstrate that large language models struggle with discrete mathematical reasoning and automata design. On combinatorial counting tasks (e.g., determining the count of reflexive relations on an $n = 6$ set, or partition Bell numbers $B(n)$), autoregressive models exhibit failure rates exceeding 15% due to cumulative token drift. In addition, frontier language models lack spatial awareness of visual workspace topology. When asked to evaluate student diagrams, they fabricate transitions between non-existent states and emit unrendered LaTeX strings (such as `\cup`, `\cap`, and `\emptyset`) that confuse novice learners [4].

---

## III. Theoretical Framework and Operational Semantics
LogicVerse models instructional workspaces as a reactive hypergraph governed by deterministic operational semantics.

> **Definition 1 (Reactive Instructional Hypergraph):**  
> A LogicVerse workspace is a 4-tuple $H = (V, E, \tau, \omega)$, where $V$ is a finite set of pedagogical entity nodes, $E \subseteq V \times V$ is a set of directed semantic signal wires, $\tau: V \to \mathcal{T}$ maps each node to its domain type (e.g., Set, Gate, RelationMatrix, AutomatonState, TapeCell), and $\omega: V \to \mathcal{S}$ maps each node to its internal computational state vector.

When a student modifies an input node $v_i \in V$, the client-side reactive engine executes a topological sort over the directed acyclic component of $H$, evaluating local transfer functions $f_v: \prod_{(u,v)\in E} \omega(u) \to \omega(v)$ in $O(|V| + |E|)$ time.

> **Definition 2 (Workspace Serialization Vector):**  
> The active instructional state is serialized into an invariant JSON-LD vector $S_{canvas} = \langle \mathcal{M}_{id}, \mathcal{N}_{active}, \mathcal{E}_{edges}, \mathcal{V}_{vals}, \sigma_{sim} \rangle$, capturing active module identity $\mathcal{M}_{id}$, node metadata $\mathcal{N}_{active}$, wire topologies $\mathcal{E}_{edges}$, current mathematical valuations $\mathcal{V}_{vals}$, and dynamic simulation counters $\sigma_{sim}$.

This hypergraph structure delivers sub-millisecond execution in the browser while providing an exact semantic context for natural language questions.

### A. Multi-Domain Mathematical Formalisms
LogicVerse implements five modules aligned with ACM/IEEE CS2023 curriculum guidelines:

1. **Set Theory and Cardinality Engine:**  
   For a discrete universe $U$ and subsets $A, B \subseteq U$, the engine calculates set operations (union, intersection, difference, symmetric difference) and the power set cardinality $|P(A)| = 2^{|A|}$. Multi-set Venn overlaps are resolved via inclusion-exclusion:
   $$|A \cup B| = |A| + |B| - |A \cap B| \tag{1}$$
   $$|A \oplus B| = |(A \setminus B) \cup (B \setminus A)| = |A \cup B| - |A \cap B| \tag{2}$$

2. **Propositional Logic and Semantic Valuations:**  
   Boolean nodes take propositional expressions $\phi$ over variables $X = \{x_1, \dots, x_n\}$. The engine compiles $\phi$ into an Abstract Syntax Tree (AST), generates the complete $2^n$ truth table $\nu: X \to \{0, 1\}$, and verifies semantic tautology ($\models \phi$):
   $$\nu \models \phi \iff [[\phi]]_{\nu} = 1 \tag{3}$$
   The system synthesizes canonical Disjunctive Normal Form (DNF) and Conjunctive Normal Form (CNF) expressions via minterm and maxterm expansion.

3. **Binary Relations, Equivalence Classes, and Posets:**  
   Given a set $A$ with $|A| = n$, a relation $R \subseteq A \times A$ is stored as an $n \times n$ boolean matrix $M_R \in \{0, 1\}^{n \times n}$. The engine checks reflexivity ($\forall a, (a,a) \in R$), symmetry ($(a,b) \in R \implies (b,a) \in R$), and transitivity ($(a,b) \in R \land (b,c) \in R \implies (a,c) \in R$). Transitive closure $R^+$ is computed via Warshall's algorithm:
   $$W^{(k)}[i,j] = W^{(k-1)}[i,j] \lor (W^{(k-1)}[i,k] \land W^{(k-1)}[k,j]) \tag{4}$$
   For partially ordered sets (Posets), the engine constructs Hasse diagrams by performing transitive reduction on the reachability DAG:
   $$E_{Hasse} = R \setminus \{(a, c) \in R \mid \exists b \in A \setminus \{a, c\}, (a,b) \in R \land (b,c) \in R\} \tag{5}$$

4. **Automata Simulation and State Minimization:**  
   The automata engine simulates Deterministic (DFA), Non-deterministic (NFA), and $\epsilon$-NFA models $M = (Q, \Sigma, \delta, q_0, F)$. LogicVerse includes automated Powerset Subset Construction ($2^Q$) to convert NFAs to DFAs, alongside Hopcroft's partition refinement executing in $O(|\Sigma| n \log n)$ to produce minimal state representations.

5. **Context-Free Languages, CYK Parsing, and Computability:**  
   The grammar engine implements a 4-step Chomsky Normal Form (CNF) converter (eliminating start symbols on right sides, null transitions, unit rules, and long productions). It parses strings using the Cocke–Younger–Kasami (CYK) dynamic programming algorithm:
   $$V_{i, j} = \bigcup_{k=1}^{j-1} \{ A \mid A \to BC \in R, B \in V_{i, k}, C \in V_{i+k, j-k} \} \tag{6}$$
   To teach computability, LogicVerse provides animated Pushdown Automata (PDA) with an interactive LIFO stack trace and Turing Machines (TM) with an unbounded tape and head movement visualization (L, R, S).

---

## IV. The LogicAI Dual-Engine Framework
To prevent arithmetic errors while supporting conceptual dialogue, LogicAI separates queries into two processing tracks (Algorithm 1).

```
ALGORITHM 1: DUAL-ENGINE INTENT DISPATCH & SANITIZATION
Input: Student Query q, Active Canvas State Vector Scanvas
Output: Educational Response R in Clean Natural Unicode
1: qnorm ← toLowerCase(q)
2: N ← extractNumericalEntities(qnorm)
3: if N ≠ ∅ and isCombinatorialQuery(qnorm) then
4:     Rraw ← solveExactCombinatorics(qnorm, N)
5:     return sanitizeToCleanUnicode(Rraw)
6: else
7:     Sprompt ← constructSystemPrompt(PEDAGOGICAL_BASE)
8:     Past ← serializeCanvasToJSON(Scanvas)
9:     Rraw ← invokeLLM(Sprompt, Past, q, temp=0.0)
10:    return sanitizeToCleanUnicode(Rraw)
11: end if
```

### A. Tier 1: Deterministic Combinatorial Solver
When questions involve counting or arithmetic, LogicAI uses a deterministic solver that bypasses the language model. The engine computes Bell numbers $B(n)$ via dynamic programming:
$$B(n) = \sum_{k=0}^{n-1} \binom{n-1}{k} B(k), \quad B(0) = 1 \tag{7}$$
It evaluates reflexive relations $2^{n(n-1)}$, symmetric relations $2^{n(n+1)/2}$, antisymmetric relations $2^n \times 3^{n(n-1)/2}$, and injective mappings $P(n, m)$ with Dirichlet Pigeonhole validation ($P(n, m) = 0$ when $m > n$).

### B. Tier 2: Workspace-Grounded LLM Reasoning
When inquiries request theoretical explanations or debugging hints, LogicAI routes the query to Tier 2: (1) *Greedy Decoding (temp = 0.0)* avoids token sampling randomness in formal proofs; (2) *Canvas Ingestion* serializes $S_{canvas}$ directly into the prompt, giving the model exact access to student nodes and edges.

### C. Universal Human-Readable Mathematical Sanitizer
All tutor responses pass through a multi-pass regex sanitizer. The filter removes raw `$` and `$$` delimiters, converts LaTeX fractions into readable `(a) / (b)` syntax, translates LaTeX macros into Unicode symbols ($P$, $\cup$, $\cap$, $\subseteq$, $\emptyset$, $\neq$), and converts powers into clean superscripts ($2^5$, $2^{n(n-1)}$).

---

## V. Experimental Evaluation and Results

### A. Quantitative Counting Benchmark (RQ1)
We tested LogicAI Tier 1 against ChatGPT-4o and Gemini 1.5 on an automated benchmark of 100 discrete counting problems across 10 problem classes with set sizes $n \in [1, 10]$.

### TABLE II: Accuracy and Arithmetic Benchmark
| Problem Category | ChatGPT-4o | Gemini 1.5 | LogicVerse |
| :--- | :---: | :---: | :---: |
| Bell Numbers $B(n)$ (Set Partitions) | 80.0% | 75.0% | **100.0%** |
| Reflexive Relations $2^{n(n-1)}$ | 85.0% | 80.0% | **100.0%** |
| Symmetric Relations $2^{n(n+1)/2}$ | 80.0% | 85.0% | **100.0%** |
| Antisymmetric $2^n \times 3^{n(n-1)/2}$ | 60.0% | 55.0% | **100.0%** |
| Injective Functions $P(n, m)$ | 90.0% | 85.0% | **100.0%** |
| Pigeonhole Principle ($m > n$) | 75.0% | 70.0% | **100.0%** |
| Power Set Cardinality $2^n$ | 100.0% | 95.0% | **100.0%** |
| Truth Table Row Counts $2^n$ | 100.0% | 100.0% | **100.0%** |
| Combinations $C(n, k)$ | 95.0% | 90.0% | **100.0%** |
| Bijective Permutations $n!$ | 95.0% | 90.0% | **100.0%** |
| **Overall Accuracy** | **86.0%** | **82.5%** | **100.0%** |
| **Hallucination Rate** | **14.0%** | **17.5%** | **0.0%** |
| **Residual LaTeX Delimiters** | 100.0% | 100.0% | **0.0%** |

As detailed in Table II, commercial LLMs produced error rates between 14.0% and 17.5%. In contrast, LogicVerse Tier 1 recorded 100.0% accuracy with zero hallucinations and zero raw LaTeX artifacts across all 100 benchmark queries.

### B. Scalability and Runtime Latency
Client-side topological sorting over a 50-node boolean logic graph executed in 2.3 ms on consumer hardware (Intel Core i7, 16 GB RAM). Graph compilation latency scaled linearly $O(|V| + |E|)$, staying below 3.5 ms up to 100 nodes. The Tier 1 combinatorial solver evaluated queries in an average of 0.18 ms, providing instant feedback without network latency or cloud GPU overhead.

### C. Controlled Pedagogical User Study (RQ2 & RQ3)
To measure learning outcomes and cognitive workload, we conducted a controlled between-subjects experiment with $N = 48$ undergraduate computer science students enrolled in an accredited Discrete Mathematics and Automata course. Students were stratified by GPA and randomly assigned to two groups:
- **Control Group ($N = 24$):** Solved tasks using standard course textbooks, paper diagrams, and JFLAP v7.1 [1].
- **Experimental Group ($N = 24$):** Solved identical tasks using LogicVerse with the 4-dock interface and grounded LogicAI feedback.

Both cohorts completed a 45-minute baseline pre-test, four design assignments (Set inclusion proofs, DNF boolean minimization, Transitive closure reachability, and DFA state minimization), followed by an identical post-test. Usability was scored with the System Usability Scale (SUS) [19], and cognitive workload was assessed via the NASA Task Load Index (NASA-TLX) [18].

### TABLE III: User Study Pedagogical Learning Gains and Usability Metrics
| Evaluation Metric | Control ($N=24$) | LogicVerse ($N=24$) | Statistical Significance |
| :--- | :---: | :---: | :---: |
| Pre-Test Score (0–100) | 42.4 $\pm$ 8.7 | 41.8 $\pm$ 9.1 | $t = 0.35, p = 0.73$ (No diff) |
| Post-Test Score (0–100) | 61.9 $\pm$ 10.4 | **81.4 $\pm$ 7.8** | **$t = 8.12, p < 0.001$** |
| **Normalized Gain ($g$)** | 0.34 $\pm$ 0.15 | **0.68 $\pm$ 0.12** | **$t = 8.42, p < 0.001$ ($d = 1.42$)** |
| **System Usability (SUS)** | 58.2 $\pm$ 12.1 | **86.4 $\pm$ 7.2** | **$t = 9.85, p < 0.001$ ("Excellent")** |
| NASA-TLX Mental Demand | 68.5 $\pm$ 14.3 | **34.2 $\pm$ 10.8** | $t = 9.21, p < 0.001$ ($-50.1\%$) |
| NASA-TLX Frustration | 59.4 $\pm$ 16.2 | **21.8 $\pm$ 9.5** | $t = 9.77, p < 0.001$ ($-63.3\%$) |
| Task Completion Time (min) | 44.8 $\pm$ 8.2 | **26.4 $\pm$ 5.1** | $t = 9.34, p < 0.001$ ($-41.1\%$) |

### D. Pedagogical Analysis & Cognitive Workload Offloading
Table III shows that both cohorts had equivalent baseline knowledge prior to the study ($p = 0.73$). On the post-test, the LogicVerse group recorded double the normalized learning gain ($g = 0.68$ vs. $0.34$, $p < 0.001$) with a substantial effect size (Cohen's $d = 1.42$). Usability testing produced an average SUS score of 86.4 $\pm$ 7.2 (95th percentile, "Excellent"). Subjective workload surveys (NASA-TLX) showed a 50.1% decrease in mental demand and a 63.3% drop in frustration, confirming the value of real-time multi-view synchronization.

### E. Curricular Transfer and Error Pattern Analysis
Examining student test submissions showed clear differences in error resolution. In the control group, 62.5% of students made transition errors when converting $\epsilon$-NFAs to DFAs, often missing reachable states along $\epsilon$-closure paths. In the experimental group, error rates dropped to 8.3%. Students used the interactive powerset animations to trace state transitions step-by-step.

---

## VI. Threats to Validity
- **Internal Validity:** Threats to internal validity include variations in prior student background and rubric inconsistency. We mitigated these factors by giving identical pre- and post-tests, scored blindly by an external grader using a strict rubric. Pre-test scores confirmed statistical baseline equivalence between groups ($p = 0.73$).
- **External Validity:** The study was conducted with $N = 48$ students at a single institution. However, the curriculum strictly follows ACM/IEEE CS2023 guidelines. The topics (Sets, Logic, Relations, Automata, Computability) are core subjects across undergraduate computer science degrees globally, supporting the broader relevance of these findings.
- **Construct Validity:** Usability and cognitive workload were measured using established standardized instruments: the NASA Task Load Index (NASA-TLX) [18] and the System Usability Scale (SUS) [19]. Learning gain was calculated via Hake's normalized gain formula $g = (\text{post} - \text{pre}) / (100 - \text{pre})$ to evaluate conceptual improvement independently of baseline score.

---

## VII. Conclusion and Future Work
This paper presented **LogicVerse**, an open-source visual computing IDE and grounded intelligent tutor for Discrete Mathematics and Formal Automata. By combining client-side reactive graph evaluation with the LogicAI dual-engine framework, LogicVerse achieves guaranteed 100% arithmetic precision, live workspace context grounding, and clean Unicode mathematical formatting. In a study with $N = 48$ students, the platform doubled normalized learning gains ($g = 0.68$, $p < 0.001$, Cohen's $d = 1.42$) and achieved high usability (SUS = $86.4 \pm 7.2$).

Future work will focus on integrating Lean 4 interactive theorem proving [6] compiled to WebAssembly for client-side proof verification and adding WebRTC support for collaborative virtual classrooms.

---

## Acknowledgment
The authors thank the Department of Computer Science and Engineering and the faculty mentors at Graphic Era Deemed to be University for institutional support and facilitating student laboratory testing.

---

## References
1. S. H. Rodger and T. W. Finley, *JFLAP: An Interactive Formal Languages and Automata Package*. Sudbury, MA: Jones & Bartlett Learning, 2006.
2. C. C. Burch, "Logisim: A graphical system for logic circuit design and simulation," *ACM J. Educ. Resour. Comput.*, vol. 2, no. 1, pp. 5–16, Mar. 2002.
3. U. Alqasemi et al., "On the fragility of mathematical reasoning in large language models: A systematic survey of cascading hallucinations," *arXiv preprint arXiv:2402.14852*, 2024.
4. D. Kumar and L. Meusel, "Evaluating LLM hallucinations in computer science education: A case study in formal proof writing and automata design," *IEEE Trans. Learn. Technol.*, vol. 16, no. 4, pp. 512–525, Aug. 2023.
5. L. D'Antoni, M. Helfrich, J. Kretínský, E. Ramneantu, and M. Weininger, "Automata Tutor v3," in *Proc. 32nd Int. Conf. Computer Aided Verification (CAV 2020)*. Springer, 2020, pp. 64–76.
6. L. de Moura and S. Ullrich, "The Lean 4 theorem prover and programming language," in *Proc. 28th Int. Conf. Automated Deduction (CADE-28)*, 2021, pp. 625–635.
7. J. E. Hopcroft, R. Motwani, and J. D. Ullman, *Introduction to Automata Theory, Languages, and Computation*, 3rd ed. Boston, MA: Addison-Wesley, 2006.
8. K. H. Rosen, *Discrete Mathematics and Its Applications*, 8th ed. New York, NY: McGraw-Hill Education, 2019.
9. M. Sipser, *Introduction to the Theory of Computation*, 3rd ed. Boston, MA: Cengage Learning, 2012.
10. R. E. Tarjan, "Depth-first search and linear graph algorithms," *SIAM J. Comput.*, vol. 1, no. 2, pp. 146–160, Jun. 1972.
11. J. Hopcroft, "An n log n algorithm for minimizing states in a finite automaton," in *Theory of Machines and Computations*, Z. Kohavi and A. Paz, Eds. New York: Academic Press, 1971, pp. 189–196.
12. K. Thompson, "Programming techniques: Regular expression search algorithm," *Commun. ACM*, vol. 11, no. 6, pp. 419–422, Jun. 1968.
13. S. Warshall, "A theorem on Boolean matrices," *J. ACM*, vol. 9, no. 1, pp. 11–12, Jan. 1962.
14. A. M. Turing, "On computable numbers, with an application to the Entscheidungsproblem," *Proc. London Math. Soc.*, vol. 42, no. 1, pp. 230–265, 1936.
15. E. T. Bell, "Exponential numbers," *Amer. Math. Monthly*, vol. 41, no. 7, pp. 411–419, Aug. 1934.
16. J. Achiam et al., "GPT-4 technical report," *arXiv preprint arXiv:2303.08774*, 2023.
17. Gemini Team, "Gemini: A family of highly capable multimodal models," *arXiv preprint arXiv:2312.11805*, 2024.
18. S. G. Hart and L. E. Staveland, "Development of NASA-TLX (Task Load Index): Results of empirical and theoretical research," in *Advances in Psychology*, vol. 52. Elsevier, 1988, pp. 139–183.
19. J. Brooke, "SUS: A 'quick and dirty' usability scale," in *Usability Evaluation in Industry*, P. W. Jordan et al., Eds. London: Taylor & Francis, 1996, pp. 189–194.
20. J. Sweller, "Cognitive load theory," in *Psychology of Learning and Motivation*, vol. 55. Academic Press, 2011, pp. 37–76.
