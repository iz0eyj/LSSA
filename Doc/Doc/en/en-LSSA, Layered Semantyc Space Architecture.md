Okay, here is the English translation of the text, keeping the "---" separators:
These notes describe a new representation of information in vector space that overcomes the limitations of standard multidimensional vectors by organizing semantic units into separate layers according to clearly distinct thematic affinities.
The goal is manifold:
 * Make the spatial location of information easily identifiable in order to modify it.
 * Consequently overcome the need for a static and immutable representation without a complete reconstruction.
 * Resolve semantic ambiguities through the logical development of cognitive paths.
 * Drastically reduce the computational cost of both creation and inference.
 * To the point that inference itself can determine the local restructuring of the representation.
   The last point is fundamental and represents the primary reason for this research: to transport the context from external memory into the representative structure, making it part of its evolutionary process.
Imagine multiple Cartesian planes stacked along the z-axis: each plane represents a defined semantic affinity space.
Each point on the plane will host a single token, associated with a specific semantic unit (e.g., God could be represented by token 0).
The fundamental difference compared to the traditional method is that each cell of the plane represents a precise point from which outgoing semantic vectors can originate, directed to other semantic units or further layers.
For example, one plane could collect all concepts related to music production (instruments, scores, tuning forks, metronomes), while another could contain all living forms (felines, canids, humans, trees, chili peppers, etc.).
A database (or a tree data structure) will keep track of all existing semantic units, indicating for each token the layer of belonging and the precise coordinates.
Thus, each concept will have a unique position within the structure.
Assuming, for example, that each plane has dimensions of 500x500 (although the size can vary between different layers), we will obtain up to 250,000 distinct tokens per plane.
It should be noted that this measure is purely hypothetical; in reality, it is almost certain that the necessary dimensions will be significantly smaller because, if the maximum expected number of possible tokens is 7,000,000 and we expect about 300 semantic affinity planes, also considering the mechanism for deleting unused tokens (we will see this later), it is very unlikely that even the largest layer will require such dimensions.
Initially, this data structure is empty. It will be the task of a classifier, fed with an entire encyclopedia, to place each concept in its respective semantic affinity space, generating it if necessary and inserting it into the database with the assigned token and coordinates.
At the end of the classifier's work, the two data structures (Cartesian planes and database) will contain all the semantic units extracted from the encyclopedia, distributed in layers according to semantic affinity.
We can call this first phase "primary training": the result will be a static representation of knowledge.
The Classifier:
Apparently, the classifier's task is arduous, but not in reality.
The classifier's task is not to materially introduce the token into the data structures, but solely to establish its correct semantic affinity layer.
For example, it must understand that the term "the" should be inserted into the layer hosting grammatical structures, "cat" into the one for living beings (perhaps separated between animal and plant kingdoms?), and so on.
Once this is done, the actual placement in the data structures will be handled by a common algorithmic solution, to which the classifier will indicate the correct semantic affinity layer and the possible need to create a new one if it doesn't already exist.
Obviously, the classifier will not be an algorithm but a good-sized model, capable of understanding the semantic planes of belonging for each token.
Objectively, this will be a slow and relatively expensive operation, but nothing compared to the costs of creating a traditional structure.
Furthermore, unlike in the past, there will never be a need for complete restructuring here.
It is not important that the chosen planes find general approval (they never could); what is decisive is the semantic coherence for that particular classifier, as this will make coherent cognitive trajectories possible.
On the role of the classifier: a simple use of existing models
In our model, the classifier is not a system to be designed or trained from scratch.
It is simply a pre-existing language model — a GPT, a Gemini, or equivalent — used via API.
It requires no fine-tuning or specific training: the model is provided with a brief contextual summary of the operations to be performed (e.g., "If you read 'cat', place it among animals", "if you read 'pesca' [peach/fishing], create different tokens for the sporting activity and the food"), and one page at a time of the encyclopedia to be processed, along with the list of semantic layers already present.
The classifier's task does not require complex reasoning or fine understanding: general linguistic competence is sufficient to determine which semantic layer a concept belongs to.
In other words: a literate mind is needed, not a genius.
This approach allows completely avoiding the costs, complexity, and time related to training.
A good existing model is enough... and a simple context instruction.
Note: since a pre-existing model deemed reliable will be used, this will minimize the risks of arbitrary placement.
Semantic Multiplicities:
Since semantic units are derived from reading texts, it is likely that some identical terms represent different meanings.
In the common representation, this is a problem, but not in ours: different meanings will correspond to different tokens, which can, if necessary, be distributed on equally different semantic affinity planes.
Old concepts disappear, others are created
Unlike more common representations, this organizational model allows for the immediate identification of the spatial location of each semantic unit, thus making it inexpensive to eliminate old tokens that are no longer used and add new ones, either by occupying free spaces in the semantic affinity layers or by adding entire layers that were not present.
An example could be represented precisely by Deep Learning or, previously, by automatic computation, concepts that required the introduction of entire layers of meanings.
Similarly, nothing prevents repositioning a token that over time has changed the meaning attributed to it, something impossible in the classic representation.
Perfect, here's how the section could sound:
Internal Memory of Semantic Nodes: Dynamic Cognitive Annotations
Within the vector space, each token, besides serving as a semantic node and the origin of cognitive vectors, can optionally host an internal memory.
This memory is not pre-allocated but represented by a simple pointer: if it is not used, it occupies no space.
The mind, through a specific interface, can send requests like:
> "Write 'consumed' in the node corresponding to 'peach' in the 'fruit' layer."
> (or "tell me the content")
> 
The algorithm, receiving this request, executes:
 * Identification of the node (token + layer)
 * Verification of the possible existence of already allocated memory
 * Allocation, reading, or modification of the memory, as requested
Most tokens will not need additional memories, making resource usage extremely efficient.
However, for those concepts that the mind deems significant — or wishes to temporarily annotate — it will be possible to store personalized information.
This internal memory is not externally visible, does not interfere with inference, and does not alter the network of cognitive vectors.
It represents a form of cognitive introspection, where the mind can jot down states, notes, tags, signals, or contexts useful to itself.
In essence: each concept can become, at the mind's discretion, a small active semantic container.
From Static Structure to Dynamic Structure
To achieve this transition, we eliminate the classifier and introduce a simple algorithm to generate semantic vectors between the present units.
Each vector will have:
an origin point (coordinates on the Cartesian plane),
an arrival point (coordinates on another point on the same plane or on a different plane),
an associated numerical weight, which will increase each time the same vector is used,
a "timestamp", useful for identifying cognitive paths and tokens no longer in use and consequently candidates for elimination.
It is possible to imagine a "garbage collection" algorithm executed at significantly different time cycles, specifically intended to eliminate data no longer used.
Unlike more classic representation models, the existence of obsolete tokens and vectors has no real influence on the computational cost of inference, except for a modest increase in search time in the index database, but it can affect the space occupation in the layers, which although large, do not have infinite dimensions.
Consequently, if all vectors connected to a token are no longer used, then the token itself no longer has a reason to exist.
If it were to become present again, it would be recreated by inference exactly as happens with terms and concepts in natural languages.
Vector Creation
The algorithmic vector creation algorithm will take various texts as input: books, dialogues, films, or any interaction with users, and will create the necessary vectors to represent them.
Practical example:
Text 1:
"The cat drinks milk from a bowl".
The algorithm will proceed as follows:
 * Vector from a conventional origin point towards the "living beings" semantic affinity plane, to the coordinates of the "cat" token.
 * New vector from the "cat" point towards the "actions" plane, coordinates of the "drink" token.
 * New vector from "drink" towards the "foods" plane, coordinates "milk".
 * New vector from "milk" towards the "numbers" plane, coordinates "a".
 * New vector from "a" towards the "kitchen tools" plane, coordinates "bowl".
   These vectors are created from scratch because they previously did not exist.
 * Text 2:
"The dog drinks from the bowl."
The algorithm operates as follows:
 * Vector from the origin to "living beings", token "dog".
 * New vector from "dog" towards the "actions" plane, token "drink".
 * New vector from "drink" towards the token "from the".
 * New vector from "from the" towards "bowl".
Here too, each vector is created from scratch, because the specific sequences ("dog" and "from the") had not yet been mapped.
Text 3:
"The canary drinks from the bowl."
In this case:
 * Vector from the origin towards the "living beings" plane, token "canary".
 * New vector from "canary" to "from the".
At this point, the algorithm recognizes that the subsequent vectors:
From "from the" towards "drink"
From "drink" towards "bowl"
are already present in the data structure.
Therefore, instead of creating new vectors, it simply increments the weight associated with each of these existing vectors.
Inference
During inference, the system not only builds relationships between concepts but also traces trajectories in semantic domains.
The very sequence of layers traversed becomes information, a level of abstraction where it is not only important what connects, but in what order and in which conceptual space the connection occurs.
In classic representations, the dimension of the inter-layer path is completely absent.
Inference occurs in a non-stratified semantic space, devoid of explicit thematic planes.
Our model, instead, makes the dynamics between domains of meaning visible and structured, thus introducing a second level of semantics: that of the cognitive trajectory.
This not only enriches semantics but also makes monitoring and correcting cognitive paths possible: the stratified structure makes it visible when an inference deviates from the expected domain, facilitating the identification of possible problems in layer attribution.
Semantic Lock: Cognitive Protection Against Decay
In the proposed model, each semantic vector includes a simple lock flag, i.e., a logical block that prevents its automatic removal by the Garbage Collector.
This function allows the mind to explicitly preserve some fundamental connections, regardless of their frequency of use.
A vector marked as "locked" will never be considered obsolete and will not be subject to automatic decay.
The semantic lock also has an important effect on the connected tokens: since each vector involves two tokens, these will maintain at least one active connection, preventing them from being removed as well, even if they are no longer actively connected to other cognitive paths.
This mechanism provides the mind with a form of selective indelible memory.
It can be used to maintain: – key concepts of identity
– critical relationships between ideas
– cognitive anchors necessary for stability, coherence, or foundational memories.
The lock flag implies no privilege on the inferential plane: the vector can be traversed or ignored, like any other.
But it cannot be deleted automatically.
In summary: the lock is a guarantee of persistence that the mind can assign to its most important ideas.
Final Note:
With this logic, the dynamic structure continuously evolves, progressively adapting to the actual use of knowledge and strengthening the most frequently used semantic links.
Clarification on the "origin point"
The data structure can be imagined as a parallelepiped formed by multiple Cartesian planes stacked along the z-axis, each representing a specific semantic affinity space.
In this spatial representation, the origin point is conventionally fixed at coordinates (0,0,0).
It is from this central point that all "cognitive trajectories" generated by the algorithm begin.
Each cognitive vector, therefore, will initially start from the origin and then proceed through the points representing the specific semantic units distributed in the various affinity planes.
In essence, the point (0,0,0) becomes the common conceptual source, from which all semantic connections generated by interaction with texts and users branch out.
Conclusions:
The model we propose introduces significant advantages:
 * Knowledge is no longer represented in an undifferentiated aggregate but well organized according to immediately identifiable areas of affinity.
 * The use of a separate database to identify correspondences between semantic units and the spatial position of tokens makes the study and modification of the entire structure trivial.
 * The cognitive path during inference, which no longer follows only global statistical proximities but logical paths guided by conceptual proximities with evaluation of only local probability, presents a very low computational cost.
 * Precisely the extremely reduced computational cost, combined with the ease of identifying the spatial location of each semantic unit, makes the classic fixed-weight model useless.
 * The initial structure formed by the Classifier does not need to be recreated; once the first version is created, it can be subsequently extended if necessary by adding tokens and possibly new layers: create once, good forever.
Resolution of Semantic Ambiguities
Information organized by semantic affinity layers helps resolve problems of context-based semantic attribution, which is quite common and often causes misunderstanding.
If a token can have more than one meaning, and indeed we see that the same token can exist in different layers, the choice will be guided by the semantic affinity planes on which the cognitive path develops most.
Disambiguation by Semantic Affinity Planes.
Polysemy:
If the word "bau" arrives at a purely static system, it will inevitably think "dog".
If the same word arrives at me, I will think... well, it depends.
Normally I will also think "dog", but if I were inside an art gallery, it is more likely that the association would be "Bauhaus".
The context has altered the way weights are interpreted.
In the system we present, the token corresponding to the concept of "bau" will exist, perhaps in a layer intended to host purely symbolic concepts, and from this, a high-weight vector will link it to the concept of "dog", in the animal kingdom layer.
But there will also be a second vector, with a much lower weight, which will lead towards the art layer, token "Bauhaus".
In the case where the primary context of the cognitive paths is the art layer, the system will have sufficient information to decide on strengthening the evaluation of this vector.
Homonymy:
The most classic case is represented by the word "pesca" (does anyone really pay attention to the tonic accent?): can we eat this peach, or do we need to equip ourselves with a fishing line?
Again, the context decides.
In our representation, multiple "pesca" tokens will exist, say one in the plant kingdom, one in foods, and yet another in recreational activities.
Again, thanks to the dominant cognitive trajectories, the system will have the necessary information to choose the correct token.
Adaptive Semantic Disambiguation
The system provides for contextual disambiguation based on direct comparison between the token to be interpreted, active temporary memories, and currently relevant semantic layers.
This static approach is effective in most cases but can be limited in the presence of ambiguous or weak signals, especially in recurring and borderline cases.
To address these cases, an adaptive disambiguation module has been introduced: a small, fully integrated neural network that assists the statistical algorithm.
This network does not replace the base engine but accompanies it, learning over time to recognize ambiguous contexts and adapting its response based on experience.
Main features: – extremely contained size (one hundred to two hundred neurons)
– simple architecture (one or two dense layers, possibly with dropout)
– incremental learning based on usage, updatable during sleep phases
– negligible computational cost, compatible with real-time processing.
The goal is not to predict the correct meaning in an absolute sense, but to refine the local interpretation when the system notices that a certain choice (e.g., "pesca = fruit") repeats consistently in specific contexts.
Example: the system repeatedly encounters the term "volo" (flight/jump) in contexts related to extreme sports. Initially, it interprets it as aerial movement.
After several similar occurrences, the adaptive module begins to prefer the sports meaning ("paragliding, hang gliding") in the presence of certain signals.
This component represents a first form of experiential adaptation, capable of increasing precision without compromising the readability and verifiability of the main system.
The Index Database
A real database is not necessary; a tree data structure combined with a map of free/occupied positions within each layer will provide all the required information, at least for this first version.
In addition, there will be a small temporary area, a sort of working memory, which will host references to the tokens and especially to the semantic affinity layers involved in the cognitive paths.
Since our model is strongly context-oriented, this temporary area will collect the necessary information to keep track of the topic being discussed.
Additionally, a second area, with a longer duration, will keep track only of the semantic affinity layers involved in recent cognitive paths.
It does not store tokens but memorizes which conceptual domains have been activated, thus providing an indication of extended context useful for eventual consolidation, adaptation, or disambiguation processes.
Computational Costs
A possible objection concerns the computational cost of reassigning the correct layer of belonging for an erroneously positioned tok