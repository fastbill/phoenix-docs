# Documentation Templates

This file contains template structures for Phoenix Framework documentation. Use these templates when creating new module documentation.

---

## Reference Documentation Template

Use this template for comprehensive module documentation (e.g., `{module}-module.md`).

```markdown
---
title: {Module} Module
---

# {Module} Module

{One paragraph description of what the module does and its purpose.}

---

## Table of Contents

- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [{Core Concept 1}](#core-concept-1)
- [{Core Concept 2}](#core-concept-2)
- [CLI Commands](#cli-commands)
- [Architecture](#architecture)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

**Related Documentation:**
- [{Related Doc 1}](./{related-doc-1}.md) - {brief description}
- [{Related Doc 2}](./{related-doc-2}.md) - {brief description}

---

## Quick Start

### 1. Register the Service Provider

```php
// In your ApplicationKernel
use Fastbill\Phoenix\Framework\Modules\{Module}\{Module}ServiceProvider;

class ApplicationKernel extends HttpKernel
{
    protected function providers(): array
    {
        return array_merge(parent::providers(), [
            new {Module}ServiceProvider(),
        ]);
    }
}
```

### 2. Configure the Module

```php
// config/.config.php
return [
    '{module}' => [
        // configuration options
    ],
];
```

### 3. Create a {Primary Primitive}

```php
// Example code showing the main use case
```

### 4. Use the Module

```php
// Example showing how to invoke/use it
```

---

## Configuration

### Full Configuration Schema

```php
return [
    '{module}' => [
        // Option with default - explain what it does
        'option_name' => 'default_value',

        // Nested configuration
        'feature' => [
            'enabled' => false,
            'setting' => 'value',
        ],
    ],
];
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `option_name` | string | `'default'` | What this option controls |
| `feature.enabled` | bool | `false` | Enable/disable feature |

---

## {Core Concept 1}

{Explanation of the core concept.}

### {Concept} Structure

```
┌─────────────────────────────────────────────────────────┐
│                    ASCII DIAGRAM                         │
│  Component A  ──────►  Component B  ──────►  Component C │
└─────────────────────────────────────────────────────────┘
```

### Creating a {Concept}

**1. {Sub-component} Class:**

```php
namespace App\{Module}\{Feature};

class {Feature}Input extends AbstractInput
{
    // Implementation
}
```

**2. {Sub-component} Class:**

```php
// Additional component code
```

### {Concept} Methods

| Method | Description |
|--------|-------------|
| `methodName($param)` | What this method does |
| `anotherMethod()` | Another description |

---

## {Core Concept 2}

{Similar structure to Core Concept 1}

---

## CLI Commands

### {module}:{command}

{Description of what the command does.}

```bash
./bin/phoenix {module}:{command} [arguments] [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--option=N` | What this option does |

---

## Architecture

### Component Overview

```
┌────────────────────────────────────────────────────────┐
│                    {Module}Service                      │
│  entryMethod($input) → Result                          │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Internal Components                   │
└────────────────────────────────────────────────────────┘
```

### Key Components

#### 1. {ComponentName}

**Location:** `src/Framework/Modules/{Module}/Services/{ComponentName}.php`

{Description of what this component does.}

```php
final class {ComponentName}
{
    public function __construct(
        private DependencyA $dep,
        private DependencyB $dep2
    ) {}

    public function method(): ReturnType
    {
        // ...
    }
}
```

### Message Flow

{Numbered explanation of how data flows through the system.}

---

## Programmatic Usage

{For modules with service APIs, show how to use them programmatically.}

### Using {Module}Service

```php
use Fastbill\Phoenix\Framework\Modules\{Module}\Services\{Module}Service;

class MyController
{
    public function __construct(private {Module}Service $service) {}

    public function myMethod(): Response
    {
        $result = $this->service->doSomething($input);

        if ($result->isSuccess()) {
            return new JsonResponse(['status' => 'ok']);
        }

        return new JsonResponse(['error' => $result->getError()], 400);
    }
}
```

### {Module}Service Methods

| Method | Description |
|--------|-------------|
| `doSomething($input)` | {Description} |
| `anotherMethod($param)` | {Description} |

---

## Testing

### Unit Testing {Concept}s

```php
class {Concept}Test extends TestCase
{
    public function testBasicBehavior(): void
    {
        // Test setup
        // Assertions
    }
}
```

### Integration Testing

```php
class {Module}IntegrationTest extends TestCase
{
    public function testFullFlow(): void
    {
        // Integration test example
    }
}
```

---

## Troubleshooting

### {Common Error Message}

```
ErrorType: {Error message text}
```

**Solution:** {How to fix it}

```php
// Code showing the fix
```

### {Another Common Issue}

{Description and solution}

---

## Related Documentation

- [{Related Doc}](./{related-doc}.md) - {Description}
```

---

## Getting Started Guide Template

Use this template for hands-on tutorial guides (e.g., `{module}-module-getting-started.md`).

```markdown
# {Module} Module: Getting Started

This hands-on guide walks you through testing and using the {Module} module with the example application. For complete reference documentation, see [{Module} Module](./{module}-module.md).

---

## Prerequisites

- {Prerequisite 1}
- {Prerequisite 2}
- Familiarity with {Phoenix concepts}

---

## Setup

### 1. Navigate to the Example

```bash
cd examples/{module}/
```

### 2. Install Dependencies

```bash
composer install
```

### 3. Start Docker Services

```bash
docker compose up -d
```

### 4. Verify Services

```bash
docker compose ps
```

---

## Basic {Feature} Usage

### {First Task}

```bash
./bin/{command} {args}
```

### {Second Task}

```bash
./bin/{command} {args}
```

### Verify {Expected Outcome}

```bash
# Verification command
```

---

## {Feature Section 2}

### {Sub-feature}

```bash
# Example command
```

**Expected output:**
- {Bullet point of what should happen}
- {Another expected outcome}

### {Options/Variations}

| Option | Description |
|--------|-------------|
| `--option` | What it does |

---

## {Feature Section 3: Error Handling/Edge Cases}

### {Scenario 1}

```bash
# Command that demonstrates this
```

**Expected behavior:**
- {What happens}
- {Why it matters}

### Why This Matters

{Explanation of the design decision.}

---

## Architectural Conventions

### {Convention 1}

{Explanation of the convention.}

```php
// ❌ Avoid this pattern
class BadExample {
    // Don't do this
}
```

**Why?** {Explanation}

**Alternative:** {Better approach or link to documentation}

### {Convention 2}

```php
// ✅ This is allowed
class GoodExample {
    // Correct approach
}
```

---

## Testing Checklist

Use this checklist to verify the {Module} module is working correctly:

### Setup
- [ ] Navigate to `examples/{module}/`
- [ ] Run `composer install`
- [ ] Start Docker services
- [ ] Verify services are running

### Basic Operations
- [ ] {Task 1} works
- [ ] {Task 2} works
- [ ] {Expected behavior verified}

### {Feature Category}
- [ ] {Specific test case}
- [ ] {Another test case}

---

## Key Concepts Summary

| Concept | Description |
|---------|-------------|
| **{Term 1}** | {Definition} |
| **{Term 2}** | {Definition} |
| **{Term 3}** | {Definition} |

---

## Next Steps

- [{Module} Module Reference](./{module}-module.md) — Complete API documentation
- [{Related Feature}](./{related}.md) — {Description}
```

---

## Key Structural Patterns

| Element | Purpose | When to Use |
|---------|---------|-------------|
| **Frontmatter** | Metadata | Reference docs only |
| **Brief intro** | Context setting | Always first |
| **Table of Contents** | Navigation | Docs > 500 lines |
| **Quick Start** | Get running fast | Reference docs |
| **Configuration Schema** | Show all options | Reference docs |
| **ASCII diagrams** | Visualize flow | Architecture sections |
| **Methods tables** | API reference | After code examples |
| **Code blocks** | Show implementation | Throughout |
| **`❌`/`✅` patterns** | Show do/don't | Conventions sections |
| **Troubleshooting** | Error resolution | Reference docs |
| **Checklists** | Verification | Getting started guides |
| **Key Concepts table** | Quick reference | Getting started guides |
| **Next Steps** | Navigation | Getting started guides |

---

## Writing Guidelines

1. **Start with the user's goal** - What are they trying to accomplish?
2. **Show working code first** - Quick Start should get them running in minutes
3. **Use consistent heading levels** - H2 for main sections, H3 for subsections
4. **Include both happy path and error cases** - Troubleshooting prevents frustration
5. **Link related documentation** - Help users discover related features
6. **Use tables for reference data** - Methods, options, configuration
7. **Use ASCII diagrams for architecture** - Visual understanding of flow
8. **Separate reference from tutorial** - Reference docs explain everything; getting started guides are hands-on
