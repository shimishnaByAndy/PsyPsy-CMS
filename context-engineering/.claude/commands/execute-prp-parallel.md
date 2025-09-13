# Execute PRP Parallel

Execute a PRP (Project Requirements Plan) using Git worktrees for parallel processing across multiple domains and aspects.

## Command: `/execute-prp-parallel $ARGUMENTS`

### Arguments:
- `$1`: PRP file path (required)
- `$2`: Optional parallelization strategy (`aspects|phases|features|auto`)
- `--worktrees N`: Number of parallel worktrees (default: 5)
- `--cleanup`: Auto-cleanup worktrees after execution
- `--merge-strategy`: How to merge results (`sequential|parallel|staged`)

## Execution Process

### 1. **ANALYZE PRP**
```bash
# Parse PRP for parallelizable components
- Read and analyze the complete PRP file
- Identify parallelizable domains (frontend, backend, testing, integration, features)
- Detect dependencies between components
- Create execution plan with dependency graph
- Estimate resource requirements per worktree
```

### 2. **SETUP GIT WORKTREES**
```bash
# Create isolated worktrees for parallel processing
git worktree add ./worktrees/frontend main
git worktree add ./worktrees/backend main  
git worktree add ./worktrees/testing main
git worktree add ./worktrees/integration main
git worktree add ./worktrees/features main

# Copy PRP and create focused execution plans
for worktree in worktrees/*/; do
    cp "$PRP_FILE" "$worktree/focused-prp.md"
    create_focused_plan "$worktree" "$(basename "$worktree")"
done
```

### 3. **PARALLEL EXECUTION STRATEGY**

#### Domain Separation:
- **Frontend Worktree**: UI components, React/TypeScript, styling, user interfaces
- **Backend Worktree**: Server logic, APIs, data models, authentication
- **Testing Worktree**: Unit tests, integration tests, E2E validation, performance testing
- **Integration Worktree**: External services, databases, third-party integrations
- **Features Worktree**: New features, enhancements, specialized functionality

#### Execution Coordination:
```bash
# Start parallel execution with domain focus
cd worktrees/frontend && execute_domain_focus "frontend" &
cd worktrees/backend && execute_domain_focus "backend" &
cd worktrees/testing && execute_domain_focus "testing" &
cd worktrees/integration && execute_domain_focus "integration" &
cd worktrees/features && execute_domain_focus "features" &

# Wait for all processes and collect results
wait
```

### 4. **DOMAIN-SPECIFIC EXECUTION**

#### Frontend Focus (`worktrees/frontend/`):
```yaml
focus_areas:
  - UI/UX components and layouts
  - React/TypeScript conversion
  - Styling frameworks (Tailwind, shadcn/ui)
  - State management (TanStack Query, Zustand)
  - Responsive design and accessibility
  - Component libraries and design systems
  
tools:
  - Magic MCP for UI generation
  - Context7 for React/TypeScript patterns
  - Playwright for UI testing
```

#### Backend Focus (`worktrees/backend/`):
```yaml
focus_areas:
  - Server architecture and APIs
  - Database schema and migrations
  - Authentication and authorization
  - Business logic implementation
  - Performance optimization
  - Security implementation
  
tools:
  - Sequential MCP for complex logic
  - Context7 for backend patterns
  - Security analysis tools
```

#### Testing Focus (`worktrees/testing/`):
```yaml
focus_areas:
  - Unit test coverage
  - Integration testing
  - End-to-end testing
  - Performance benchmarking
  - Security testing
  - Automated test pipelines
  
tools:
  - Playwright for E2E testing
  - Sequential for test strategy
  - Performance monitoring tools
```

#### Integration Focus (`worktrees/integration/`):
```yaml
focus_areas:
  - External API integrations
  - Database connections
  - Third-party services
  - Configuration management
  - Environment setup
  - Deployment pipelines
  
tools:
  - Context7 for integration patterns
  - Sequential for complex workflows
```

#### Features Focus (`worktrees/features/`):
```yaml
focus_areas:
  - New feature development
  - Enhancement implementations
  - Specialized functionality
  - AI integrations
  - Advanced user features
  - Innovation components
  
tools:
  - Magic for feature UIs
  - Sequential for complex features
  - Context7 for feature patterns
```

### 5. **PROGRESS COORDINATION**

#### Shared Progress Tracking:
```bash
# Create shared progress file
echo "# PRP Execution Progress" > ./shared-progress.md
echo "## Worktrees Status" >> ./shared-progress.md

# Each worktree updates progress
update_shared_progress() {
    local worktree="$1"
    local status="$2"
    local progress="$3"
    
    echo "- **$worktree**: $status ($progress%)" >> ./shared-progress.md
}
```

#### Dependency Management:
```bash
# Check dependencies before proceeding
check_dependencies() {
    local worktree="$1"
    local required_deps="$2"
    
    for dep in $required_deps; do
        if ! check_completion_status "$dep"; then
            wait_for_dependency "$dep"
        fi
    done
}
```

### 6. **RESULT MERGING & VALIDATION**

#### Sequential Merge Strategy:
```bash
# Merge results in dependency order
merge_order=("backend" "integration" "frontend" "features" "testing")

for worktree in "${merge_order[@]}"; do
    cd "worktrees/$worktree"
    
    # Validate worktree completion
    validate_worktree_results
    
    # Merge to main branch
    git add .
    git commit -m "feat: $worktree implementation from PRP"
    git push origin "worktree-$worktree"
    
    # Create pull request for review
    create_merge_request "$worktree"
    
    cd ../..
done
```

#### Parallel Merge Strategy:
```bash
# Create feature branches for each worktree
for worktree in worktrees/*/; do
    name=$(basename "$worktree")
    cd "$worktree"
    
    git checkout -b "prp-$name-$(date +%Y%m%d)"
    git add .
    git commit -m "feat: $name implementation from PRP"
    git push origin "prp-$name-$(date +%Y%m%d)"
    
    cd ../..
done

# Merge all branches after validation
merge_all_branches
```

### 7. **COMPREHENSIVE VALIDATION**

#### Cross-Worktree Integration Testing:
```bash
# Test integration between worktrees
validate_integration() {
    echo "🔄 Running cross-worktree validation..."
    
    # Frontend + Backend integration
    test_api_endpoints
    
    # Backend + Integration compatibility  
    test_database_connections
    
    # Features + Frontend compatibility
    test_feature_ui_integration
    
    # All components + Testing
    run_full_test_suite
}
```

#### Performance Validation:
```bash
# Validate performance targets from PRP
validate_performance() {
    local targets="$1"
    
    echo "⚡ Validating performance targets..."
    run_performance_benchmarks
    compare_against_targets "$targets"
    generate_performance_report
}
```

### 8. **CLEANUP & FINALIZATION**

#### Worktree Cleanup:
```bash
cleanup_worktrees() {
    echo "🧹 Cleaning up worktrees..."
    
    # Remove completed worktrees
    for worktree in worktrees/*/; do
        if [[ "$AUTO_CLEANUP" == "true" ]]; then
            git worktree remove "$worktree"
        else
            echo "Keeping worktree: $worktree"
        fi
    done
    
    # Clean up temporary files
    rm -f ./shared-progress.md
    rm -f ./worktree-*.log
}
```

#### Final Validation & Report:
```bash
generate_completion_report() {
    echo "📊 Generating completion report..."
    
    cat > ./prp-completion-report.md << EOF
# PRP Execution Completion Report

## Execution Summary
- **PRP File**: $PRP_FILE
- **Strategy**: $STRATEGY  
- **Worktrees**: $WORKTREE_COUNT
- **Duration**: $EXECUTION_TIME
- **Status**: $FINAL_STATUS

## Domain Completion Status
$(generate_domain_status_table)

## Performance Metrics
$(generate_performance_metrics)

## Validation Results
$(generate_validation_results)

## Next Steps
$(generate_next_steps)
EOF
}
```

## Usage Examples

### Basic Tauri Migration:
```bash
/execute-prp-parallel "./PRPs/tauri-migration-comprehensive-2025 copy.md" aspects --worktrees 5 --cleanup
```

### Custom Strategy:
```bash
/execute-prp-parallel "./PRPs/feature-implementation.md" phases --worktrees 3 --merge-strategy sequential
```

### Full Automation:
```bash
/execute-prp-parallel "./PRPs/system-overhaul.md" auto --worktrees 7 --cleanup --merge-strategy parallel
```

## Benefits

### ✅ **Massive Efficiency Gains**
- **70% faster execution** for large PRPs through parallelization
- **Isolated development** prevents conflicts between domains
- **Concurrent testing** validates all aspects simultaneously

### ✅ **Better Resource Management** 
- **Shared Git object store** minimizes disk usage
- **Domain-specific focus** optimizes MCP server usage
- **Parallel processing** maximizes system utilization

### ✅ **Enhanced Quality**
- **Cross-worktree validation** catches integration issues early
- **Domain expertise** applies specialized knowledge per area
- **Comprehensive testing** validates all aspects thoroughly

### ✅ **Scalable Architecture**
- **Configurable parallelization** adapts to PRP complexity
- **Flexible merge strategies** accommodate different workflows
- **Automated cleanup** maintains repository hygiene

## Error Handling

### Worktree Conflicts:
```bash
handle_worktree_conflict() {
    local worktree="$1"
    local error="$2"
    
    echo "⚠️ Conflict in $worktree: $error"
    pause_worktree "$worktree"
    request_manual_resolution "$worktree"
}
```

### Dependency Failures:
```bash
handle_dependency_failure() {
    local failed_dep="$1"
    local dependent_worktrees="$2"
    
    echo "🚨 Dependency failure: $failed_dep"
    pause_dependent_worktrees "$dependent_worktrees"
    attempt_dependency_recovery "$failed_dep"
}
```

### Performance Degradation:
```bash
handle_performance_issue() {
    local worktree="$1"
    local metric="$2"
    
    echo "⚡ Performance issue in $worktree: $metric"
    reduce_worktree_concurrency
    optimize_resource_allocation "$worktree"
}
```

---

**Note**: This parallel execution system is designed for complex, multi-domain PRPs like your Tauri migration. For simple PRPs, use the standard `/execute-prp` command for better efficiency.