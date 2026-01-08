---
title: Documentation Guide
---

# Documentation Guide

This guide explains how to write effective documentation for the Phoenix Framework. It covers when and how to use the templates in `_template.md`, writing best practices, and common pitfalls to avoid.

---

## Table of Contents

- [Documentation Types](#documentation-types)
- [Using the Templates](#using-the-templates)
- [Writing Best Practices](#writing-best-practices)
- [Code Examples](#code-examples)
- [Structure and Organization](#structure-and-organization)
- [Visual Elements](#visual-elements)
- [Common Pitfalls](#common-pitfalls)
- [Review Checklist](#review-checklist)

---

## Documentation Types

Phoenix Framework documentation falls into three categories:

### Reference Documentation

**Purpose:** Complete, authoritative documentation of a module's capabilities.

**Audience:** Developers who need to understand all available options and behaviors.

**Characteristics:**
- Comprehensive coverage of all features
- Configuration schemas with all options
- API reference tables
- Architecture explanations
- Troubleshooting section

**File naming:** `{module}-module.md`

**Examples:** `queue-module.md`, `workflow-module.md`

### Getting Started Guides

**Purpose:** Hands-on tutorial to get developers productive quickly.

**Audience:** Developers new to the module who want to try it immediately.

**Characteristics:**
- Step-by-step instructions
- Working example application
- Verification steps after each action
- Testing checklist
- Links to reference docs for deeper learning

**File naming:** `{module}-module-getting-started.md`

**Examples:** `queue-module-getting-started.md`

### Concept Guides

**Purpose:** Explain specific patterns, approaches, or architectural decisions.

**Audience:** Developers who need to understand how to apply a particular pattern.

**Characteristics:**
- Focus on a single concept or pattern
- Explain "why" this pattern exists
- Show complete, realistic examples
- Include anti-patterns to avoid
- Link to related reference documentation

**File naming:** `{concept}.md` or `{topic}-{subtopic}.md`

**Examples:** `aggregation-in-queries.md`, `architecture-decision-guide.md`

### When to Create Each Type

| Scenario | Document Type |
|----------|---------------|
| New module added to framework | Both reference + getting started |
| Simple utility or helper | Reference only |
| Complex feature with example app | Both reference + getting started |
| API or configuration changes | Update existing reference |
| New use case or pattern | Concept guide or add section to reference |
| Architectural pattern explanation | Concept guide |
| Cross-cutting concern (e.g., aggregation) | Concept guide |

---

## Using the Templates

### Step 1: Choose the Right Template

From `_template.md`, copy the appropriate template:
- **Reference Documentation Template** for comprehensive module docs
- **Getting Started Guide Template** for hands-on tutorials

### Step 2: Replace Placeholders

Templates use `{placeholder}` syntax. Replace all placeholders:

| Placeholder | Replace With |
|-------------|--------------|
| `{Module}` | PascalCase module name (e.g., `Queue`, `Workflow`) |
| `{module}` | lowercase module name (e.g., `queue`, `workflow`) |
| `{Core Concept 1}` | Primary concept name (e.g., `BackgroundTasks`, `Node Types`) |
| `{Feature}` | Specific feature name |
| `{Related Doc}` | Actual related document name |

### Step 3: Adapt the Structure

Not every section applies to every module. Adapt as needed:

**Remove sections that don't apply:**
- No CLI commands? Remove that section
- No async processing? Remove worker documentation
- Simple module? Combine or simplify sections

**Add sections for unique features:**
- Module has unique concepts? Add dedicated sections
- Special integration requirements? Add integration section
- Security considerations? Add security section

### Step 4: Fill in Content

Work through each section:

1. **Write the introduction first** - Forces you to articulate the module's purpose
2. **Quick Start next** - Ensures you understand the minimal path to usage
3. **Core concepts** - Document the main abstractions
4. **Details last** - Configuration, architecture, troubleshooting

---

## Writing Best Practices

### Know Your Reader

Write for developers who:
- Are experienced with PHP but new to Phoenix
- Want to accomplish a task, not read documentation
- Will scan headings and code examples first
- Need to find answers quickly when debugging

### Lead with Purpose

Start every section by explaining **why**, not **what**:

```markdown
<!-- ❌ Weak opening -->
## Configuration

The module has several configuration options.

<!-- ✅ Strong opening -->
## Configuration

Configure queue channels to route tasks to different backends
based on priority, reliability requirements, or processing capacity.
```

### Use Active Voice

Active voice is clearer and more direct:

```markdown
<!-- ❌ Passive -->
The task is dispatched by the QueueService.

<!-- ✅ Active -->
The QueueService dispatches the task.
```

### Be Concise

Every word should earn its place:

```markdown
<!-- ❌ Verbose -->
In order to be able to dispatch a task to the queue, you will
first need to create an instance of the task class.

<!-- ✅ Concise -->
Create a task instance, then dispatch it:
```

### Use Consistent Terminology

Define terms once and use them consistently:

| Term | Meaning | Don't Say |
|------|---------|-----------|
| BackgroundTask | Async task processed by workers | job, queued task, async task |
| Task | Sync task dispatched immediately | command, action |
| Channel | Named queue for routing | queue, transport |
| Worker | Process that consumes tasks | consumer, processor |

### Write Scannable Content

Developers scan before they read. Help them:

- **Use descriptive headings** that answer questions
- **Bold key terms** on first use
- **Use bullet points** for lists of 3+ items
- **Use tables** for reference data
- **Keep paragraphs short** (3-4 sentences max)
- **Avoid emojis in headings** - use plain text for consistency

---

## Code Examples

### Show Complete, Working Code

Every code example should be copy-pasteable:

```php
// ❌ Incomplete - missing imports, context
class MyHandler {
    public function handle($task) {
        // ...
    }
}

// ✅ Complete - shows namespace, imports, full implementation
namespace App\Tasks\ProcessOrder;

use Fastbill\Phoenix\Framework\Primitives\Task\TaskHandlerInterface;
use Fastbill\Phoenix\Framework\Primitives\Task\TaskInterface;
use Fastbill\Phoenix\Framework\Primitives\Task\TaskResultInterface;

class ProcessOrderHandler implements TaskHandlerInterface
{
    public function handle(TaskInterface $task): TaskResultInterface
    {
        $input = $task->getInput();
        // Process the order...
        return ProcessOrderResult::success($orderId);
    }
}
```

### PHP 7.4 Compatibility

Phoenix supports PHP 7.4 in CI. All code examples must avoid PHP 8.0+ syntax:

```php
// ❌ PHP 8.0+ syntax - don't use in examples
class MyQuery implements QueryInterface
{
    public function __construct(
        public array $filter = []  // Constructor property promotion
    ) {}
}

// ✅ PHP 7.4 compatible
class MyQuery implements QueryInterface
{
    /** @var array<string, mixed> */
    private $filter;

    /**
     * @param array<string, mixed> $filter
     */
    public function __construct(array $filter = [])
    {
        $this->filter = $filter;
    }

    /**
     * @return array<string, mixed>
     */
    public function getFilter(): array
    {
        return $this->filter;
    }
}
```

**Avoid these PHP 8.0+ features:**
- Constructor property promotion
- Named arguments (`fn(name: $value)`)
- Union types (`int|string`)
- `match` expressions
- Nullsafe operator (`$x?->y`)
- `: mixed` return type

### Use Realistic Examples

Examples should reflect actual use cases:

```php
// ❌ Abstract - doesn't help understanding
class FooHandler {
    public function handle($task) {
        return new BarResult($baz);
    }
}

// ✅ Realistic - shows actual domain usage
class SendInvoiceEmailHandler implements TaskHandlerInterface
{
    public function handle(TaskInterface $task): TaskResultInterface
    {
        $input = $task->getInput();

        $invoice = $this->invoiceRepository->find($input->getInvoiceId());
        if ($invoice === null) {
            return SendInvoiceEmailResult::notFound($input->getInvoiceId());
        }

        $this->mailer->send($invoice->getCustomerEmail(), $invoice);

        return SendInvoiceEmailResult::sent($invoice->getId());
    }
}
```

### Show Both Success and Error Paths

Don't just show the happy path:

```php
$result = $workflowService->execute($workflow);

if ($result->isSuccess()) {
    $context = $result->getContext();
    $userId = $context->getResult('user')->getUserId();
    return new Response(['userId' => $userId]);
}

// Handle failure
return new Response(
    ['error' => $result->getError()->getMessage()],
    400
);
```

### Annotate Complex Code

Use comments to explain non-obvious behavior:

```php
$envelope = $queueService->queueTask($task);

// Get the task ID (UUID) for tracking
// This ID persists across retries and can be used for correlation
$taskId = QueueService::getTaskId($envelope);
```

### Show Anti-Patterns Clearly

When showing what NOT to do, make it unmistakable:

```php
// ❌ Anti-pattern: BackgroundTask dispatching another BackgroundTask
class MyTaskHandler implements TaskHandlerInterface
{
    public function handle(TaskInterface $task): TaskResultInterface
    {
        // DON'T DO THIS - violates tiered architecture
        $this->queueService->queueTask(new AnotherBackgroundTask(...));
    }
}

// ✅ Correct: Use workflow for orchestration
$workflowService->execute(new MyWorkflow($input));
```

---

## Structure and Organization

### Heading Hierarchy

Use consistent heading levels:

```markdown
# Document Title (H1) - Only one per document

## Major Section (H2) - Table of contents entries

### Subsection (H3) - Logical groupings within sections

#### Detail (H4) - Rarely needed, for deep nesting only
```

### Section Order

Follow this order for reference documentation:

1. **Title and introduction** - What and why
2. **Table of Contents** - Navigation (for docs > 500 lines)
3. **Quick Start** - Minimal path to working code
4. **Configuration** - All options explained
5. **Core Concepts** - Main abstractions and patterns
6. **Usage/API** - Methods, options, examples
7. **CLI Commands** - Command-line interface
8. **Architecture** - Internal design (for complex modules)
9. **Testing** - How to test code using this module
10. **Troubleshooting** - Common errors and solutions
11. **Related Documentation** - Links to related docs

### Cross-Referencing

Link between documents to help navigation:

```markdown
**Related Documentation:**
- [Queue Module](queue-module.md) - Async BackgroundTask processing
- [Tasks](tasks.md) - Synchronous task dispatch

See [Workflow Testing](workflow-testing.md) for test utilities.

For queue configuration, refer to [Queue Module - Configuration](queue-module.md#configuration).
```

---

## Visual Elements

### When to Use Tables

Use tables for:
- **Method/API reference** - parameters, return types
- **Configuration options** - name, type, default, description
- **Comparison** - when to use A vs B
- **Quick reference** - key concepts summary

```markdown
| Method | Description |
|--------|-------------|
| `queueTask($task)` | Queue to default channel |
| `queueTaskOn($task, $channel)` | Queue to specific channel |
```

### When to Use ASCII Diagrams

Use diagrams for:
- **Data flow** - how information moves through system
- **Architecture** - component relationships
- **State machines** - status transitions
- **Decision trees** - branching logic

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Application   │────►│   QueueService  │────►│    Transport    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Handler     │◄────│     Worker      │◄────│   (persisted)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### When to Use Bullet Lists

Use bullets for:
- Lists of 3+ related items
- Steps that can be done in any order
- Features or characteristics
- Prerequisites

Use numbered lists for:
- Sequential steps (must be done in order)
- Prioritized items
- Countable procedures

### When to Use Code Blocks

Use inline code for:
- Class names: `QueueService`
- Method names: `queueTask()`
- File paths: `config/.config.php`
- Configuration keys: `'default_channel'`

Use fenced code blocks for:
- Multi-line code examples
- Configuration files
- Command-line examples
- File contents

---

## Common Pitfalls

### Pitfall 1: Documenting Implementation, Not Usage

```markdown
<!-- ❌ Implementation details users don't need -->
The QueueService uses Symfony Messenger's MessageBus internally.
It wraps the dispatch call with a ChannelStamp that the
ChannelSendersLocator uses to route messages.

<!-- ✅ Usage-focused -->
The QueueService routes tasks to different queue backends
based on the channel you specify:

```php
$queueService->queueTaskOn($task, 'high-priority');
```
```

### Pitfall 2: Missing the "Why"

```markdown
<!-- ❌ Just states the fact -->
BackgroundTasks cannot dispatch other BackgroundTasks.

<!-- ✅ Explains the reasoning -->
BackgroundTasks cannot dispatch other BackgroundTasks. This constraint
exists because BackgroundTasks are entry points in the tiered architecture.
They orchestrate domain primitives (Commands, Queries, Events), not other
entry points. Use the Workflow module for complex task orchestration.
```

### Pitfall 3: Outdated Examples

Prevent outdated examples by:
- Using actual class names from the codebase
- Testing examples before publishing
- Including version information when APIs change
- Reviewing docs when code changes

### Pitfall 4: Assuming Knowledge

```markdown
<!-- ❌ Assumes reader knows Phoenix internals -->
Register the provider in your kernel.

<!-- ✅ Shows exactly what to do -->
Register the service provider in your application kernel:

```php
// In your ApplicationKernel
protected function providers(): array
{
    return array_merge(parent::providers(), [
        new QueueServiceProvider(),
    ]);
}
```
```

### Pitfall 5: Wall of Text

Break up long explanations:
- Add subheadings every 3-4 paragraphs
- Use bullet points for lists
- Insert code examples to illustrate points
- Add diagrams for complex flows

---

## Review Checklist

Before publishing documentation, verify:

### Content
- [ ] Introduction explains what the module does and why it exists
- [ ] Quick Start gets reader to working code in < 5 minutes
- [ ] All configuration options are documented
- [ ] Error cases and troubleshooting are covered
- [ ] Related documentation is linked

### Code Examples
- [ ] All code examples are complete and copy-pasteable
- [ ] Examples use realistic domain names (not Foo/Bar)
- [ ] Both success and error paths are shown
- [ ] Anti-patterns are clearly marked with ❌
- [ ] Imports and namespaces are included

### Structure
- [ ] Headings follow consistent hierarchy
- [ ] Table of contents matches actual headings
- [ ] Sections are in logical order
- [ ] Cross-references use correct anchor links

### Writing
- [ ] Active voice is used throughout
- [ ] Terminology is consistent
- [ ] Paragraphs are short (3-4 sentences)
- [ ] No jargon without explanation

### Visual Elements
- [ ] Tables are used for reference data
- [ ] Diagrams are used for architecture/flow
- [ ] Code blocks have correct language tags
- [ ] Inline code is used for identifiers

### Implementation Verification
- [ ] Exception class names match actual file names in `Exceptions/` directory
- [ ] Config file paths are correct (`config/.config.php` not `config/packages/`)
- [ ] Config schema structure matches `ConfigSchemaProvider` (nested vs flat)
- [ ] Config default values match `ConfigSchemaProvider::getSchema()` definitions
- [ ] Interface methods match actual interface definitions
- [ ] Property names in data classes match implementation (check for undocumented properties)
- [ ] Twig helper function signatures match implementation

---

## Quick Reference

### File Naming

| Document Type | Pattern | Example |
|---------------|---------|---------|
| Module reference | `{module}-module.md` | `queue-module.md` |
| Getting started | `{module}-module-getting-started.md` | `queue-module-getting-started.md` |
| Concept guide | `{concept}.md` | `tasks.md` |
| Feature deep-dive | `{module}-{feature}.md` | `workflow-persistence.md` |

### Markdown Conventions

| Element | Syntax |
|---------|--------|
| Document title | `# Title` (one per doc) |
| Section | `## Section` |
| Subsection | `### Subsection` |
| Code identifier | `` `ClassName` `` |
| File path | `` `path/to/file.php` `` |
| Emphasis | `**bold**` for key terms |
| Good example | Start with `// ✅` |
| Bad example | Start with `// ❌` |

### Writing Shortcuts

| Instead of... | Write... |
|---------------|----------|
| "In order to" | "To" |
| "It is necessary to" | "You must" |
| "There are several options that can be used" | "Options include" |
| "The task will be processed by the worker" | "The worker processes the task" |
| "It should be noted that" | (just state the fact) |
