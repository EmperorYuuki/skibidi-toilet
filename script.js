// DOM Elements
const modelSelect = document.getElementById('model-select');
const translationBox = document.getElementById('translation-box');
const promptBox = document.getElementById('prompt-box');
const fandomBox = document.getElementById('fandom-box');
const notesBox = document.getElementById('notes-box');
const outputBox = document.getElementById('output-box');
const translateBtn = document.getElementById('translate-btn');
const stopBtn = document.getElementById('stop-btn'); // Added stop button
const clearBtn = document.getElementById('clear-btn');
const saveAllBtn = document.getElementById('save-all-btn');
const statusMessage = document.getElementById('status-message');
const pricingDisplay = document.getElementById('pricing-display');
const copyOutputBtn = document.getElementById('copy-output-btn');
const saveButtons = document.querySelectorAll('.save-btn');
const temperatureSlider = document.getElementById('temperature-slider');
const temperatureValueDisplay = document.getElementById('temperature-value');
const sourceLanguageInput = document.getElementById('source-language');
const targetLanguageInput = document.getElementById('target-language'); // Although disabled, might be useful
const streamToggle = document.getElementById('stream-toggle');
const clearInputBtn = document.getElementById('clear-input-btn');
const clearOutputAreaBtn = document.getElementById('clear-output-area-btn'); // New button for clearing output area
const generateSummaryBtn = document.getElementById('generate-summary-btn');
const summaryArea = document.querySelector('.summary-area');
const summaryBox = document.getElementById('summary-box');
const copySummaryBtn = document.getElementById('copy-summary-btn');
const useSummaryBtn = document.getElementById('use-summary-btn');
const progressIndicatorContainer = document.getElementById('progress-indicator-container'); // New progress container

// Glossary DOM Elements
const glossaryTermSourceInput = document.getElementById('glossary-term-source');
const glossaryTermTargetInput = document.getElementById('glossary-term-target');
const addGlossaryTermBtn = document.getElementById('add-glossary-term-btn');
const glossaryDisplayArea = document.getElementById('glossary-display-area');
const noGlossaryTermsMsg = document.querySelector('.no-glossary-terms');

// Tokenizer and Cost DOM Elements
const inputTokenCountEl = document.getElementById('input-token-count');
const inputCostEstimateEl = document.getElementById('input-cost-estimate');

// Prompt Template Management DOM Elements
const promptTemplateNameInput = document.getElementById('prompt-template-name');
const savePromptAsBtn = document.getElementById('save-prompt-as-btn');
const savedPromptsSelect = document.getElementById('saved-prompts-select');
const loadPromptBtn = document.getElementById('load-prompt-btn');
const deletePromptBtn = document.getElementById('delete-prompt-btn');

// Clear All button from the main app controls
const clearAllAppBtn = document.getElementById('clear-all-btn'); 

// OpenRouter API Key Input
const openrouterApiKeyInput = document.getElementById('openrouter-api-key');

// --- Constants ---
const CONSTANTS = {
    STATUS_TYPES: {
        INFO: 'info',
        SUCCESS: 'success',
        ERROR: 'error',
        PROCESSING: 'processing',
        WARNING: 'warning'
    },
    DEFAULT_VALUES: {
        FANDOM_CONTEXT: 'None provided.',
        NOTES: 'None provided.',
        SUMMARY: 'None provided.',
        SOURCE_LANGUAGE: 'Japanese',
        TEMPERATURE: 0.7,
        STREAM_ENABLED: false, // Default for stream toggle if not in localStorage
        INTER_CHUNK_SUMMARY_ENABLED: false, // Default for inter-chunk summary toggle
        PROJECT_NAME: 'Untitled Project' // Default project name
    },
    TIMEOUTS: {
        AUTO_SAVE_DEBOUNCE: 1500,
        STATUS_MESSAGE_DEFAULT: 5000,
        STATUS_LOADED_SESSION: 3000,
        STREAM_BUFFER_FLUSH_INTERVAL: 100 // ms, for flushing buffered stream content to DOM
    },
    LOCAL_STORAGE_KEYS: {
        TRANSLATION_CONTENT: 'translationContent',
        PROMPT_CONTENT: 'promptContent',
        NOTES_CONTENT: 'notesContent',
        FANDOM_CONTENT: 'fandomContent',
        OUTPUT_CONTENT: 'outputContent',
        STREAM_ENABLED: 'streamEnabled',
        SELECTED_MODEL: 'selectedModel',
        SOURCE_LANGUAGE: 'sourceLanguage',
        TEMPERATURE: 'temperature',
        GROK_API_KEY: 'grokApiKey',
        DEEPSEEK_API_KEY: 'deepseekApiKey',
        OPENROUTER_API_KEY: 'openrouterApiKey', // New key for OpenRouter
        SAVED_PROMPTS: 'fanficTranslatorSavedPrompts',
        INTER_CHUNK_SUMMARY_ENABLED: 'interChunkSummaryEnabled', // New key
        GLOSSARY_TERMS: 'fanficTranslatorGlossary', // Key for glossary
        GLOSSARY_REPLACE_TOGGLE: 'fanficTranslatorGlossaryReplaceToggle', // New key for the toggle
        TARGET_LANGUAGE: 'fanficTranslatorTargetLanguage' // New key for target language
        // DARK_MODE: 'darkMode' // Not actively used for setting, but was a key
    },
    PROJECT_STORAGE: {
        ACTIVE_PROJECT_ID: 'fanficTranslatorActiveProject',
        PROJECT_LIST: 'fanficTranslatorProjects',
        GLOBAL_KEYS: ['grokApiKey', 'deepseekApiKey', 'openrouterApiKey'] // Added OpenRouter API key
    },
    API_KEY_PLACEHOLDERS: {
        GROK: 'YOUR_GROK_API_KEY',
        DEEPSEEK: 'YOUR_DEEPSEEK_API_KEY',
        OPENROUTER: 'YOUR_OPENROUTER_API_KEY' // New placeholder for OpenRouter
    },
    MODELS: {
        GROK_PREFIX: 'grok-',
        DEEPSEEK_CHAT: 'deepseek-chat',
        OPENROUTER_PREFIX: 'openrouter/', // New prefix for OpenRouter models
        DEFAULT_MAX_OUTPUT_TOKENS_GROK: 131072, // Reverted to original value
        DEFAULT_MAX_OUTPUT_TOKENS_DEEPSEEK: 8000,   // Added
        DEFAULT_MAX_OUTPUT_TOKENS_OPENROUTER: 8000 // Default for OpenRouter, adjust as needed
    },
    CHUNKING: { // Added new category for chunking constants
        DEFAULT_GROK_TARGET_TOKENS: 22000,
        DEFAULT_DEEPSEEK_TARGET_TOKENS: 6000,
        DEFAULT_OPENROUTER_TARGET_TOKENS: 7000 // Default for OpenRouter, adjust as needed
    },
    UI: {
        DEFAULT_STATUS_MESSAGE: 'Ready'
    },
    PROMPTS: { // Added new category for prompts
        AI_GLOSSARY_GENERATION: `You are an expert in terminology extraction for translation.
Given the following "Source Text", "Fandom Context", "Translator Notes", "Source Language", "Target Language", and any "Existing Glossary Terms", identify key terms, names, or phrases that should be included in a glossary for consistent translation.

For each term you identify, provide:
1. A Category from the predefined list below.
2. The Original Term in the Source Language.
3. Its direct Translation into the Target Language.

Predefined Categories (Choose one for each term):
- Characters
- Locations
- Techniques
- Items
- Concepts
- Titles
- Organizations
- Other (use for terms that don\'t fit other categories)

Output Format (Strictly Adhere):
Each term must be on a new line, formatted exactly as: "Category: Original Term: Translated Term"
Example: "Characters: Uzumaki Naruto: Naruto Uzumaki"

Constraints:
- Review the "Existing Glossary Terms" (if provided). Avoid re-listing terms that are already well-defined unless you are suggesting a significant correction or a more appropriate category.
- Focus on identifying *new* terms or *improving* existing ones.
- Only include terms that are non-trivial or specific to the context.
- Do not include common words unless they have a very specific meaning in this context.
- If no new or improved terms are found, output "No new glossary terms identified or improvements needed."
- Do not add any introductory or concluding remarks, just the list of terms or the "no new terms" message.

Source Language: {source_language}
Target Language: {target_language}

Fandom Context (if provided):
{fandom_context}

Translator Notes & Special Instructions (if provided):
{notes}

Existing Glossary Terms (if any):
{existing_glossary_terms}

Source Text to Analyze:
{source_text}`
    }
};

// ProjectManager Module
const ProjectManager = {
    activeProjectId: null,
    projectList: [],
    
    // Initialize the project system
    init() {
        this.loadProjectList();
        this.ensureActiveProject();
        this.renderProjectSidebar();
        this.initProjectSettingsModal();
        this.initProjectEvents();
    },
    
    // Load project list from localStorage
    loadProjectList() {
        try {
            const projectListJson = localStorage.getItem(CONSTANTS.PROJECT_STORAGE.PROJECT_LIST);
            this.projectList = projectListJson ? JSON.parse(projectListJson) : [];
            console.log('[Projects] Loaded project list:', this.projectList);
        } catch (error) {
            console.error('[Projects] Error loading project list:', error);
            this.projectList = [];
        }
    },
    
    // Make sure we have at least one project and a valid active project
    ensureActiveProject() {
        // Create default project if none exist
        if (this.projectList.length === 0) {
            console.log('[Projects] No projects found, creating default project');
            const defaultId = this.generateProjectId();
            this.projectList.push({
                id: defaultId,
                name: CONSTANTS.DEFAULT_VALUES.PROJECT_NAME,
                created: Date.now(),
                lastModified: Date.now()
            });
            this.saveProjectList();
            
            // Set as active project
            this.activeProjectId = defaultId;
            this.saveActiveProjectId();
            
            // Migrate existing data to this project
            this.migrateGlobalToProject(defaultId);
        } else {
            // Load the active project ID
            const storedActiveId = localStorage.getItem(CONSTANTS.PROJECT_STORAGE.ACTIVE_PROJECT_ID);
            
            // Check if the stored active ID is valid
            if (storedActiveId && this.projectList.some(p => p.id === storedActiveId)) {
                this.activeProjectId = storedActiveId;
            } else {
                // Default to first project if active ID is invalid
                this.activeProjectId = this.projectList[0].id;
                this.saveActiveProjectId();
            }
        }
        
        // Update the UI to show the active project
        this.updateActiveProjectUI();
    },
    
    // Generate a unique project ID
    generateProjectId() {
        return `project_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    },
    
    // Save the project list to localStorage
    saveProjectList() {
        localStorage.setItem(CONSTANTS.PROJECT_STORAGE.PROJECT_LIST, JSON.stringify(this.projectList));
    },
    
    // Save the active project ID to localStorage
    saveActiveProjectId() {
        localStorage.setItem(CONSTANTS.PROJECT_STORAGE.ACTIVE_PROJECT_ID, this.activeProjectId);
    },
    
    // Get a project-scoped key
    getScopedKey(key) {
        // Check if this is a global key (not project-scoped)
        if (CONSTANTS.PROJECT_STORAGE.GLOBAL_KEYS.includes(key)) {
            return key;
        }
        return `${this.activeProjectId}_${key}`;
    },
    
    // Migrate existing global data to a project
    migrateGlobalToProject(projectId) {
        console.log(`[Projects] Migrating global data to project ${projectId}`);
        
        // Temporarily remember the active project ID
        const originalActiveId = this.activeProjectId;
        this.activeProjectId = projectId;
        
        // Get all localStorage keys
        const allKeys = Object.keys(localStorage);
        
        // For each key that corresponds to a CONSTANTS.LOCAL_STORAGE_KEYS value
        // and is not a global key, copy it to a project-scoped key
        Object.values(CONSTANTS.LOCAL_STORAGE_KEYS).forEach(key => {
            if (!CONSTANTS.PROJECT_STORAGE.GLOBAL_KEYS.includes(key) && allKeys.includes(key)) {
                const value = localStorage.getItem(key);
                if (value !== null) {
                    const scopedKey = this.getScopedKey(key);
                    
                    // Don't overwrite existing project data
                    if (!localStorage.getItem(scopedKey)) {
                        localStorage.setItem(scopedKey, value);
                        console.log(`[Projects] Migrated ${key} to ${scopedKey}`);
                    } else {
                        console.log(`[Projects] Skipped migration for ${key}: project already has data at ${scopedKey}`);
                    }
                }
            }
        });
        
        // Restore the original active project ID
        this.activeProjectId = originalActiveId;
    },
    
    // Create a new project
    createProject(name) {
        const projectId = this.generateProjectId();
        const newProject = {
            id: projectId,
            name: name || CONSTANTS.DEFAULT_VALUES.PROJECT_NAME,
            created: Date.now(),
            lastModified: Date.now()
        };
        
        this.projectList.push(newProject);
        this.saveProjectList();
        
        console.log(`[Projects] Created new project: ${newProject.name} (${projectId})`);
        return projectId;
    },
    
    // Switch to a different project
    switchProject(projectId) {
        // Ensure the project exists
        const projectExists = this.projectList.some(p => p.id === projectId);
        if (!projectExists) {
            console.error(`[Projects] Cannot switch to non-existent project: ${projectId}`);
            updateStatus('Error: Project not found', CONSTANTS.STATUS_TYPES.ERROR);
            return false;
        }
        
        // No need to switch if already active
        if (projectId === this.activeProjectId) {
            return true;
        }
        
        console.log(`[Projects] Switching from project ${this.activeProjectId} to ${projectId}`);
        
        try {
            // Save current project state
            this.saveCurrentProjectState();
            
            // Update active project ID
            this.activeProjectId = projectId;
            this.saveActiveProjectId();
            
            // Update last modified timestamp
            this.updateProjectLastModified(projectId);
            
            // Load the new project data
            loadFromLocalStorage();
            
            // Update UI
            this.updateActiveProjectUI();
            this.renderProjectSidebar();
            
            // Show success message
            const project = this.projectList.find(p => p.id === projectId);
            if (project) {
                updateStatus(`Switched to project: ${project.name}`, CONSTANTS.STATUS_TYPES.SUCCESS);
            }
            
            return true;
        } catch (error) {
            console.error(`[Projects] Error switching to project ${projectId}:`, error);
            updateStatus('Error switching projects', CONSTANTS.STATUS_TYPES.ERROR);
            return false;
        }
    },
    
    // Save the current project state to avoid data loss when switching
    saveCurrentProjectState() {
        if (!this.activeProjectId) return;
        
        try {
            // Save all visible fields that might have unsaved changes
            const fieldsToSave = [
                { element: translationBox, key: CONSTANTS.LOCAL_STORAGE_KEYS.TRANSLATION_CONTENT },
                { element: promptBox, key: CONSTANTS.LOCAL_STORAGE_KEYS.PROMPT_CONTENT },
                { element: notesBox, key: CONSTANTS.LOCAL_STORAGE_KEYS.NOTES_CONTENT },
                { element: fandomBox, key: CONSTANTS.LOCAL_STORAGE_KEYS.FANDOM_CONTENT },
                { element: outputBox, key: CONSTANTS.LOCAL_STORAGE_KEYS.OUTPUT_CONTENT, isHTML: true }
            ];
            
            fieldsToSave.forEach(field => {
                if (field.element) {
                    const value = field.isHTML ? field.element.innerHTML : field.element.value;
                    saveToLocalStorage(field.key, value);
                }
            });
            
            // Save other state
            if (streamToggle) saveToLocalStorage(CONSTANTS.LOCAL_STORAGE_KEYS.STREAM_ENABLED, streamToggle.checked);
            if (modelSelect) saveToLocalStorage(CONSTANTS.LOCAL_STORAGE_KEYS.SELECTED_MODEL, modelSelect.value);
            if (sourceLanguageInput) saveToLocalStorage(CONSTANTS.LOCAL_STORAGE_KEYS.SOURCE_LANGUAGE, sourceLanguageInput.value);
            if (targetLanguageInput) saveToLocalStorage(CONSTANTS.LOCAL_STORAGE_KEYS.TARGET_LANGUAGE, targetLanguageInput.value);
            if (temperatureSlider) saveToLocalStorage(CONSTANTS.LOCAL_STORAGE_KEYS.TEMPERATURE, temperatureSlider.value);
            
            const interChunkSummaryToggle = document.getElementById('inter-chunk-summary-toggle');
            if (interChunkSummaryToggle) {
                saveToLocalStorage(CONSTANTS.LOCAL_STORAGE_KEYS.INTER_CHUNK_SUMMARY_ENABLED, interChunkSummaryToggle.checked);
            }
            
            const glossaryReplaceToggle = document.getElementById('glossary-replace-toggle');
            if (glossaryReplaceToggle) {
                saveToLocalStorage(CONSTANTS.LOCAL_STORAGE_KEYS.GLOSSARY_REPLACE_TOGGLE, glossaryReplaceToggle.checked);
            }
            
            console.log(`[Projects] Saved current state for project ${this.activeProjectId}`);
        } catch (error) {
            console.error('[Projects] Error saving current project state:', error);
        }
    },
    
    // Delete a project
    deleteProject(projectId) {
        // Don't allow deleting the last project
        if (this.projectList.length <= 1) {
            updateStatus('Cannot delete the only project', CONSTANTS.STATUS_TYPES.WARNING);
            return false;
        }
        
        // Find the project name for the status message
        const project = this.projectList.find(p => p.id === projectId);
        const projectName = project ? project.name : 'Unknown Project';
        
        // Remove from project list
        this.projectList = this.projectList.filter(p => p.id !== projectId);
        this.saveProjectList();
        
        // Clear all localStorage keys for this project
        this.clearProjectData(projectId);
        
        // If we deleted the active project, switch to another one
        if (this.activeProjectId === projectId) {
            // Switch to the first available project
            this.activeProjectId = this.projectList[0].id;
            this.saveActiveProjectId();
            
            // Load the new project data
            loadFromLocalStorage();
            
            // Update UI
            this.updateActiveProjectUI();
        }
        
        // Update the project sidebar
        this.renderProjectSidebar();
        
        updateStatus(`Deleted project: ${projectName}`, CONSTANTS.STATUS_TYPES.SUCCESS);
        return true;
    },
    
    // Clear all localStorage data for a specific project
    clearProjectData(projectId) {
        // Get all localStorage keys
        const allKeys = Object.keys(localStorage);
        
        // Remove all keys that start with the project ID
        const prefix = `${projectId}_`;
        allKeys.forEach(key => {
            if (key.startsWith(prefix)) {
                localStorage.removeItem(key);
                console.log(`[Projects] Removed ${key} from localStorage`);
            }
        });
    },
    
    // Rename a project
    renameProject(projectId, newName) {
        const projectIndex = this.projectList.findIndex(p => p.id === projectId);
        if (projectIndex === -1) {
            return false;
        }
        
        const oldName = this.projectList[projectIndex].name;
        this.projectList[projectIndex].name = newName || CONSTANTS.DEFAULT_VALUES.PROJECT_NAME;
        this.projectList[projectIndex].lastModified = Date.now();
        this.saveProjectList();
        
        // Update UI if this is the active project
        if (projectId === this.activeProjectId) {
            this.updateActiveProjectUI();
        }
        
        // Update project sidebar
        this.renderProjectSidebar();
        
        updateStatus(`Renamed project from "${oldName}" to "${newName}"`, CONSTANTS.STATUS_TYPES.SUCCESS);
        return true;
    },
    
    // Update the lastModified timestamp for a project
    updateProjectLastModified(projectId) {
        const projectIndex = this.projectList.findIndex(p => p.id === projectId);
        if (projectIndex !== -1) {
            this.projectList[projectIndex].lastModified = Date.now();
            this.saveProjectList();
        }
    },
    
    // Update the UI to reflect the active project
    updateActiveProjectUI() {
        const project = this.projectList.find(p => p.id === this.activeProjectId);
        if (!project) return;
        
        // Update project name display
        const projectNameElement = document.getElementById('active-project-name');
        if (projectNameElement) {
            projectNameElement.textContent = project.name;
        }
    },
    
    // Render the project sidebar
    renderProjectSidebar() {
        const projectList = document.getElementById('project-list');
        if (!projectList) return;
        
        // Clear existing content
        projectList.innerHTML = '';
        
        // Sort projects by lastModified (most recent first)
        const sortedProjects = [...this.projectList].sort((a, b) => b.lastModified - a.lastModified);
        
        // Add each project to the sidebar
        sortedProjects.forEach(project => {
            const projectItem = document.createElement('div');
            projectItem.className = `project-item ${project.id === this.activeProjectId ? 'active' : ''}`;
            projectItem.dataset.projectId = project.id;
            
            // Project name area (main clickable area)
            const nameArea = document.createElement('div');
            nameArea.className = 'project-name-area';
            nameArea.textContent = project.name;
            
            // Project actions (rename, delete)
            const actions = document.createElement('div');
            actions.className = 'project-actions';
            
            // Rename button
            const renameBtn = document.createElement('button');
            renameBtn.className = 'project-action';
            renameBtn.innerHTML = '<i class="fas fa-edit"></i>';
            renameBtn.title = 'Rename project';
            renameBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent clicking the parent
                this.handleRenameProject(project.id);
            });
            
            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'project-action';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.title = 'Delete project';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent clicking the parent
                this.handleDeleteProject(project.id);
            });
            
            // Add buttons to actions
            actions.appendChild(renameBtn);
            actions.appendChild(deleteBtn);
            
            // Add all elements to project item
            projectItem.appendChild(nameArea);
            projectItem.appendChild(actions);
            
            // Add click handler to switch projects
            projectItem.addEventListener('click', () => {
                this.switchProject(project.id);
            });
            
            // Add to project list
            projectList.appendChild(projectItem);
        });
    },
    
    // Initialize project settings modal
    initProjectSettingsModal() {
        const projectSettingsModal = document.getElementById('project-settings-modal');
        const projectSettingsBtn = document.getElementById('project-settings-btn');
        const closeProjectModalBtn = document.getElementById('close-project-modal');
        const saveProjectSettingsBtn = document.getElementById('save-project-settings');
        const projectNameInput = document.getElementById('project-name-input');
        const deleteCurrentProjectBtn = document.getElementById('delete-current-project-btn');
        const exportProjectBtn = document.getElementById('export-project-btn');
        const importProjectBtn = document.getElementById('import-project-btn');
        
        if (!projectSettingsModal || !projectSettingsBtn) return;
        
        let focusedElementBeforeModal = null;
        
        // Open modal
        projectSettingsBtn.addEventListener('click', () => {
            focusedElementBeforeModal = document.activeElement;
            
            // Populate input with current project name
            if (projectNameInput) {
                const project = this.projectList.find(p => p.id === this.activeProjectId);
                if (project) {
                    projectNameInput.value = project.name;
                }
            }
            
            projectSettingsModal.style.display = 'flex';
            if (projectNameInput) projectNameInput.focus();
        });
        
        // Close modal
        const closeModal = () => {
            projectSettingsModal.style.display = 'none';
            if (focusedElementBeforeModal) focusedElementBeforeModal.focus();
        };
        
        if (closeProjectModalBtn) {
            closeProjectModalBtn.addEventListener('click', closeModal);
        }
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === projectSettingsModal) {
                closeModal();
            }
        });
        
        // Save project settings
        if (saveProjectSettingsBtn && projectNameInput) {
            saveProjectSettingsBtn.addEventListener('click', () => {
                const newName = projectNameInput.value.trim();
                if (newName) {
                    this.renameProject(this.activeProjectId, newName);
                    closeModal();
                } else {
                    updateStatus('Project name cannot be empty', CONSTANTS.STATUS_TYPES.WARNING);
                }
            });
        }
        
        // Delete current project
        if (deleteCurrentProjectBtn) {
            deleteCurrentProjectBtn.addEventListener('click', () => {
                this.handleDeleteProject(this.activeProjectId);
                closeModal();
            });
        }
        
        // Export project
        if (exportProjectBtn) {
            exportProjectBtn.addEventListener('click', () => {
                this.exportProject(this.activeProjectId);
                closeModal();
            });
        }
        
        // Import project
        if (importProjectBtn) {
            // Create a hidden file input
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.json';
            fileInput.style.display = 'none';
            fileInput.id = 'project-import-file';
            document.body.appendChild(fileInput);
            
            // Handle file selection
            fileInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    const reader = new FileReader();
                    
                    reader.onload = (event) => {
                        try {
                            const jsonData = event.target.result;
                            this.importProject(jsonData);
                            closeModal();
                        } catch (error) {
                            console.error('[Projects] Error reading project file:', error);
                            updateStatus('Error reading project file', CONSTANTS.STATUS_TYPES.ERROR);
                        }
                    };
                    
                    reader.readAsText(file);
                }
                
                // Reset the file input
                fileInput.value = '';
            });
            
            // Trigger file selection on button click
            importProjectBtn.addEventListener('click', () => {
                fileInput.click();
            });
        }
    },
    
    // Handle project events
    initProjectEvents() {
        // Create new project button
        const createProjectBtn = document.getElementById('create-project-btn');
        if (createProjectBtn) {
            createProjectBtn.addEventListener('click', () => {
                this.showCreateProjectModal();
            });
        }
        
        // Project search
        const projectSearch = document.getElementById('project-search');
        if (projectSearch) {
            projectSearch.addEventListener('input', () => {
                const searchTerm = projectSearch.value.toLowerCase();
                const projectItems = document.querySelectorAll('.project-item');
                
                projectItems.forEach(item => {
                    const projectName = item.querySelector('.project-name-area').textContent.toLowerCase();
                    if (projectName.includes(searchTerm)) {
                        item.style.display = '';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        }
        
        // Set up close handlers for project modals
        const closeCreateModalBtn = document.getElementById('close-create-project-modal');
        if (closeCreateModalBtn) {
            closeCreateModalBtn.addEventListener('click', () => {
                const modal = document.getElementById('create-project-modal');
                if (modal) modal.style.display = 'none';
            });
        }
        
        const closeRenameModalBtn = document.getElementById('close-rename-project-modal');
        if (closeRenameModalBtn) {
            closeRenameModalBtn.addEventListener('click', () => {
                const modal = document.getElementById('rename-project-modal');
                if (modal) modal.style.display = 'none';
            });
        }
        
        const closeDeleteModalBtn = document.getElementById('close-delete-project-modal');
        if (closeDeleteModalBtn) {
            closeDeleteModalBtn.addEventListener('click', () => {
                const modal = document.getElementById('delete-project-modal');
                if (modal) modal.style.display = 'none';
            });
        }
        
        // Click outside to close modals
        window.addEventListener('click', (e) => {
            const createModal = document.getElementById('create-project-modal');
            const renameModal = document.getElementById('rename-project-modal');
            const deleteModal = document.getElementById('delete-project-modal');
            
            if (e.target === createModal) createModal.style.display = 'none';
            if (e.target === renameModal) renameModal.style.display = 'none';
            if (e.target === deleteModal) deleteModal.style.display = 'none';
        });
        
        // Submit handlers for project modals
        const createProjectSubmitBtn = document.getElementById('create-project-submit');
        if (createProjectSubmitBtn) {
            createProjectSubmitBtn.addEventListener('click', () => {
                const nameInput = document.getElementById('new-project-name');
                if (nameInput && nameInput.value.trim()) {
                    const id = this.createProject(nameInput.value.trim());
                    this.switchProject(id);
                    
                    // Clear and close modal
                    nameInput.value = '';
                    const modal = document.getElementById('create-project-modal');
                    if (modal) modal.style.display = 'none';
                } else {
                    updateStatus('Project name cannot be empty', CONSTANTS.STATUS_TYPES.WARNING);
                }
            });
        }
        
        const renameProjectSubmitBtn = document.getElementById('rename-project-submit');
        if (renameProjectSubmitBtn) {
            renameProjectSubmitBtn.addEventListener('click', () => {
                const nameInput = document.getElementById('rename-project-name');
                const projectIdInput = document.getElementById('rename-project-id');
                
                if (nameInput && nameInput.value.trim() && projectIdInput && projectIdInput.value) {
                    this.renameProject(projectIdInput.value, nameInput.value.trim());
                    
                    // Clear and close modal
                    nameInput.value = '';
                    projectIdInput.value = '';
                    const modal = document.getElementById('rename-project-modal');
                    if (modal) modal.style.display = 'none';
                } else {
                    updateStatus('Project name cannot be empty', CONSTANTS.STATUS_TYPES.WARNING);
                }
            });
        }
        
        const deleteProjectSubmitBtn = document.getElementById('delete-project-submit');
        if (deleteProjectSubmitBtn) {
            deleteProjectSubmitBtn.addEventListener('click', () => {
                const projectIdInput = document.getElementById('delete-project-id');
                
                if (projectIdInput && projectIdInput.value) {
                    this.deleteProject(projectIdInput.value);
                    
                    // Clear and close modal
                    projectIdInput.value = '';
                    const modal = document.getElementById('delete-project-modal');
                    if (modal) modal.style.display = 'none';
                }
            });
        }
    },
    
    // Show modal to create a new project
    showCreateProjectModal() {
        const modal = document.getElementById('create-project-modal');
        const nameInput = document.getElementById('new-project-name');
        
        if (modal && nameInput) {
            nameInput.value = '';
            modal.style.display = 'flex';
            nameInput.focus();
            
            // Add enter key listener
            const enterHandler = (e) => {
                if (e.key === 'Enter') {
                    document.getElementById('create-project-submit').click();
                    nameInput.removeEventListener('keyup', enterHandler);
                }
            };
            nameInput.addEventListener('keyup', enterHandler);
        }
    },
    
    // Show modal to rename a project
    showRenameProjectModal(projectId) {
        const modal = document.getElementById('rename-project-modal');
        const nameInput = document.getElementById('rename-project-name');
        const projectIdInput = document.getElementById('rename-project-id');
        
        if (modal && nameInput && projectIdInput) {
            const project = this.projectList.find(p => p.id === projectId);
            if (project) {
                nameInput.value = project.name;
                projectIdInput.value = projectId;
                modal.style.display = 'flex';
                nameInput.focus();
                
                // Add enter key listener
                const enterHandler = (e) => {
                    if (e.key === 'Enter') {
                        document.getElementById('rename-project-submit').click();
                        nameInput.removeEventListener('keyup', enterHandler);
                    }
                };
                nameInput.addEventListener('keyup', enterHandler);
            }
        }
    },
    
    // Show modal to confirm project deletion
    showDeleteProjectModal(projectId) {
        const modal = document.getElementById('delete-project-modal');
        const projectIdInput = document.getElementById('delete-project-id');
        const projectNameSpan = document.getElementById('delete-project-name');
        
        if (modal && projectIdInput && projectNameSpan) {
            const project = this.projectList.find(p => p.id === projectId);
            if (project) {
                projectIdInput.value = projectId;
                projectNameSpan.textContent = project.name;
                modal.style.display = 'flex';
                
                document.getElementById('delete-project-submit').focus();
            }
        }
    },
    
    // Handle project events that were previously using browser dialogs
    handleCreateProject() {
        this.showCreateProjectModal();
    },
    
    handleRenameProject(projectId) {
        this.showRenameProjectModal(projectId);
    },
    
    handleDeleteProject(projectId) {
        this.showDeleteProjectModal(projectId);
    },
    
    // Export a project to JSON 
    exportProject(projectId) {
        const projectData = this.getProjectData(projectId || this.activeProjectId);
        if (!projectData) {
            updateStatus('Error exporting project: Project not found', CONSTANTS.STATUS_TYPES.ERROR);
            return;
        }
        
        try {
            // Convert to JSON string
            const jsonString = JSON.stringify(projectData, null, 2);
            
            // Create a Blob and download link
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            // Create and trigger download
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = `${projectData.project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_project.json`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);
            
            updateStatus(`Project "${projectData.project.name}" exported successfully`, CONSTANTS.STATUS_TYPES.SUCCESS);
        } catch (error) {
            console.error('[Projects] Error exporting project:', error);
            updateStatus('Error exporting project', CONSTANTS.STATUS_TYPES.ERROR);
        }
    },
    
    // Import a project from JSON
    importProject(jsonData) {
        try {
            // Parse the JSON data
            const projectData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            
            // Validate the project data structure
            if (!projectData.project || !projectData.project.name || !projectData.data) {
                updateStatus('Invalid project file format', CONSTANTS.STATUS_TYPES.ERROR);
                return false;
            }
            
            // Generate a new unique ID for the imported project
            const newProjectId = this.generateProjectId();
            
            // Create the project
            const projectMeta = {
                id: newProjectId,
                name: projectData.project.name,
                created: Date.now(),
                lastModified: Date.now(),
                imported: true,
                originalId: projectData.project.id,
                importDate: Date.now()
            };
            
            // Add to project list
            this.projectList.push(projectMeta);
            this.saveProjectList();
            
            // Import all project data
            const projectDataEntries = Object.entries(projectData.data);
            for (const [key, value] of projectDataEntries) {
                // Skip if the key doesn't match any of our known storage keys
                if (!Object.values(CONSTANTS.LOCAL_STORAGE_KEYS).includes(key)) continue;
                
                // Store the data with the new project ID
                const newKey = `${newProjectId}_${key}`;
                localStorage.setItem(newKey, value);
            }
            
            updateStatus(`Project "${projectMeta.name}" imported successfully`, CONSTANTS.STATUS_TYPES.SUCCESS);
            console.log(`[Projects] Imported project "${projectMeta.name}" with ID ${newProjectId}`);
            
            // Switch to the new project
            this.switchProject(newProjectId);
            
            return true;
        } catch (error) {
            console.error('[Projects] Error importing project:', error);
            updateStatus('Error importing project', CONSTANTS.STATUS_TYPES.ERROR);
            return false;
        }
    },
    
    // Get all data for a specific project
    getProjectData(projectId) {
        const project = this.projectList.find(p => p.id === projectId);
        if (!project) {
            console.error(`[Projects] Project not found: ${projectId}`);
            return null;
        }
        
        try {
            // Save the current project state if exporting the active project
            if (projectId === this.activeProjectId) {
                this.saveCurrentProjectState();
            }
            
            // Collect all localStorage keys for this project
            const allKeys = Object.keys(localStorage);
            const projectKeys = allKeys.filter(key => key.startsWith(`${projectId}_`));
            
            // Create data object with all project values
            const data = {};
            projectKeys.forEach(key => {
                // Extract the original key without project prefix
                const originalKey = key.substring(projectId.length + 1);
                data[originalKey] = localStorage.getItem(key);
            });
            
            return {
                project: {
                    id: project.id,
                    name: project.name,
                    created: project.created,
                    lastModified: project.lastModified
                },
                data: data
            };
        } catch (error) {
            console.error(`[Projects] Error getting project data for ${projectId}:`, error);
            return null;
        }
    }
};

// API Key (Replace with secure handling in production)
// These will be populated from localStorage by loadFromLocalStorage
let grokApiKey = ''; 
let deepseekApiKey = '';
let openrouterApiKey = ''; // New variable for OpenRouter API key

let openRouterModelData = {}; // To store fetched OpenRouter model details

// Add a global variable for the tokenizer server URL
let tokenizerServerUrl = null; // Default to null, to be set by config

// Debounce function
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

// --- Default Prompt Template ---
const defaultPromptTemplate = `Translate the following text from {source_language} into {target_language}. Provide ONLY the translated text itself, without any introductory phrases, concluding remarks, explanations, or any other conversational text. The output must be exclusively the direct translation.

Fandom Context (if provided, use to inform translation nuances):{fandom_context}

Previous Chapter Summary (for continuity, if provided):{previous_chapter_summary}

Previous Chunk Summaries (for context, if provided):{previous_chunk_summaries}

Translator Notes & Special Instructions (if provided, follow strictly):{notes}

Glossary Terms (if provided, strictly adhere to these translations):
{glossary_terms}

Source Text to Translate:

{source_text}`;

// Model Pricing Data (Example - Update with actual grok pricing if available)
const modelPricing = {
    // grok Prices (per million tokens, based on image)
    'grok-3-latest':            { input: '$3.00', completion: '$15.00', context: '131k' },
    'grok-3-fast-latest':       { input: '$5.00', completion: '$25.00', context: '131k' },
    'grok-3-mini-latest':       { input: '$0.30', completion: '$0.50', context: '131k' },
    'grok-3-mini-fast-latest':  { input: '$0.60', completion: '$4.00', context: '131k' },
    // DeepSeek (Placeholder - update if you have real data)
    'deepseek-chat':            { input: '$0.27', completion: '$1.10', context: '64k' }, // Standard Price (Cache Miss)
    // OpenRouter - Prices vary by model, these are examples per 1M tokens (Input/Output)
    'openrouter/anthropic/claude-3-haiku-20240307': { input: '$0.25', completion: '$1.25', context: '200k' },
    'openrouter/google/gemini-pro-1.5':             { input: '$0.50', completion: '$1.50', context: '1M' }, // Example price, check OpenRouter for specifics
    'openrouter/mistralai/mistral-7b-instruct':     { input: '$0.07', completion: '$0.07', context: '32k' },
    'openrouter/openai/gpt-3.5-turbo':              { input: '$0.50', completion: '$1.50', context: '16k' }, // Prices subject to change
    'openrouter/openai/gpt-4-turbo':                { input: '$10.00', completion: '$30.00', context: '128k' },
    // OpenRouter prices will be fetched dynamically
}; 

// Function to load tunnel configuration
async function loadTunnelConfig() {
    try {
        const response = await fetch('tunnel_config.json');
        if (response.ok) {
            const config = await response.json();
            if (config && config.tokenizer_url) {
                tokenizerServerUrl = config.tokenizer_url;
                console.log(`[Config] Using tokenizer server URL from tunnel_config.json: ${tokenizerServerUrl}`);
            } else {
                tokenizerServerUrl = null; // Ensure it's null if key is missing
                console.warn('[Config] tunnel_config.json found but tokenizer_url is missing or empty.');
            }
        } else {
            tokenizerServerUrl = null; // Ensure it's null if file not found
            console.warn('[Config] tunnel_config.json not found or not accessible.');
        }
    } catch (error) {
        tokenizerServerUrl = null; // Ensure it's null on error
        console.error('[Config] Error loading tunnel_config.json:', error);
    }
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', async () => { // Make DOMContentLoaded async
    console.info('[DOMReady] DOM fully loaded and parsed. Initializing application...');
    try {
        // Initialize ProjectManager first
        console.info('[DOMReady] Phase 0: Initializing Project Manager...');
        ProjectManager.init();
        
        // Set up sidebar toggle immediately to ensure it works
        const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');
        console.log('[DEBUG] Toggle sidebar button element:', toggleSidebarBtn);
        
        if (toggleSidebarBtn) {
            console.log('[UI] Setting up sidebar toggle button');
            toggleSidebarBtn.addEventListener('click', function() {
                console.log('[DEBUG] Toggle sidebar button clicked');
                const sidebar = document.getElementById('project-sidebar');
                console.log('[DEBUG] Sidebar element:', sidebar);
                
                if (sidebar) {
                    console.log('[UI] Toggling sidebar collapsed state. Current class list:', sidebar.classList);
                    sidebar.classList.toggle('collapsed');
                    console.log('[UI] Sidebar class list after toggle:', sidebar.classList);
                    
                    // Toggle the icon direction
                    const icon = this.querySelector('i');
                    console.log('[DEBUG] Toggle icon element:', icon);
                    
                    if (icon) {
                        if (sidebar.classList.contains('collapsed')) {
                            console.log('[UI] Changing icon to right-arrow');
                            icon.classList.remove('fa-chevron-left');
                            icon.classList.add('fa-chevron-right');
                        } else {
                            console.log('[UI] Changing icon to left-arrow');
                            icon.classList.remove('fa-chevron-right');
                            icon.classList.add('fa-chevron-left');
                        }
                    }
                }
            });
        } else {
            console.warn('[UI] Sidebar toggle button not found');
        }
        
        // Mobile sidebar toggle
        const showSidebarBtn = document.getElementById('show-sidebar-btn');
        if (showSidebarBtn) {
            showSidebarBtn.addEventListener('click', () => {
                const sidebar = document.getElementById('project-sidebar');
                if (sidebar) sidebar.classList.toggle('show');
            });
        }
        
        // Load tunnel config first
        console.info('[DOMReady] Phase 1: Loading tunnel configuration...');
        await loadTunnelConfig(); // Await the loading of the tunnel config

        // Load saved state first
        console.info('[DOMReady] Phase 2: Loading user data from local storage...');
        loadFromLocalStorage(); // This now also populates API keys into their modal inputs
        
        // Check if keys are present and update UI accordingly
        console.info('[DOMReady] Phase 3: Checking API keys and updating UI...');
        checkApiKey(); // This also updates the status message initially
        
        // Update pricing display based on loaded model (initial call)
        console.info('[DOMReady] Phase 4: Updating model pricing display (initial)...');
        updatePricingDisplay();

        // Load OpenRouter models dynamically
        console.info('[DOMReady] Phase 5: Loading OpenRouter Models...');
        await loadOpenRouterModels(); 
        // After models are loaded, if an OpenRouter model was pre-selected from localStorage,
        // its pricing might not have been available. Re-run updatePricingDisplay.
        if (modelSelect.value && modelSelect.value.startsWith(CONSTANTS.MODELS.OPENROUTER_PREFIX)) {
            console.info('[DOMReady] Re-updating pricing display after OpenRouter models loaded.');
            updatePricingDisplay();
        }


        console.info('[DOMReady] Phase 6: Attaching event listeners...');
        
        // Set up component-specific event listeners that were moved from separate listeners
        setupPlaceholderButtons();
        setupGlossaryButtonEvents();
        
        // Add event listeners for buttons with null checks
        if (translateBtn) translateBtn.addEventListener('click', handleTranslation);
        if (clearBtn) clearBtn.addEventListener('click', clearContextualFields); // Renamed function call
        if (saveAllBtn) saveAllBtn.addEventListener('click', saveAllAsZip);
        if (modelSelect) {
            modelSelect.addEventListener('change', () => {
                updatePricingDisplay();
                saveToLocalStorage(CONSTANTS.LOCAL_STORAGE_KEYS.SELECTED_MODEL, modelSelect.value);
                checkApiKey();
                updateTokenCountAndCost(); // Call new function
            });
        }
        
        // Initialize word counters with null checks
        const sourceCounterElement = document.getElementById('input-word-count'); // Corrected ID
        const outputCounterElement = document.getElementById('output-word-count'); // Corrected ID
        
        if (sourceCounterElement && translationBox) {
            const debouncedUpdateInputWordCountAndReplace = debounce(() => {
                updateWordCount(translationBox, document.getElementById('input-word-count'));
                updateTokenCountAndCost();
                if (glossaryReplaceActive) { // Check toggle state
                    console.log('[InputDebounce] Glossary replace active, calling handleReplaceInInput.');
                    debouncedHandleReplaceInInput(); // No force, let the function decide based on its internal toggle check
                }
            }, 250);
            translationBox.addEventListener('input', debouncedUpdateInputWordCountAndReplace);
        }
        
        if (outputCounterElement && outputBox) {
            const debouncedUpdateOutputWordCount = debounce(() => updateWordCount(outputBox, outputCounterElement), 250);
            // updateWordCount(outputBox, outputCounterElement); // Initial call handled later
            outputBox.addEventListener('input', debouncedUpdateOutputWordCount); 
            outputBox.addEventListener('paste', () => {
                setTimeout(debouncedUpdateOutputWordCount, 100); 
            });
        }
        
        // Add event listeners for save buttons with null checks
        document.querySelectorAll('.save-btn').forEach(button => {
            if (button) {
                button.addEventListener('click', function() {
                    const targetId = this.getAttribute('data-target');
                    if (targetId) {
                        const filename = targetId.replace('-box', '') + '.txt';
                        saveTextAsFile(targetId, filename);
                        updateStatus(`Saved ${filename}`, CONSTANTS.STATUS_TYPES.SUCCESS);
                    }
                });
            }
        });
        
        // Add event listener for copy button with null check
        if (copyOutputBtn) {
            copyOutputBtn.addEventListener('click', function() {
                const textToCopy = outputBox.innerText || outputBox.textContent;
                copyToClipboard(textToCopy); // Original function handles status update
                
                const originalText = copyOutputBtn.innerHTML;
                copyOutputBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                copyOutputBtn.disabled = true;
                
                setTimeout(() => {
                    copyOutputBtn.innerHTML = originalText;
                    copyOutputBtn.disabled = false;
                }, 2000);
            });
        }
        
        // Add event listeners for summary generation with null checks
        if (generateSummaryBtn) generateSummaryBtn.addEventListener('click', handleSummaryGeneration);
        if (copySummaryBtn) copySummaryBtn.addEventListener('click', () => copyToClipboard(summaryBox.value, 'Summary copied!'));
        if (useSummaryBtn) {
            useSummaryBtn.addEventListener('click', () => {
                appendSummaryToTextarea(notesBox, summaryBox.value, CONSTANTS.LOCAL_STORAGE_KEYS.NOTES_CONTENT, 'Notes');
            });
        }

        // Event listeners for Prompt Template Management
        if (savePromptAsBtn) savePromptAsBtn.addEventListener('click', handleSavePromptAs);
        if (loadPromptBtn) loadPromptBtn.addEventListener('click', handleLoadSelectedPrompt);
        if (deletePromptBtn) deletePromptBtn.addEventListener('click', handleDeleteSelectedPrompt);

        // Load saved prompt templates into dropdown
        loadSavedPromptTemplatesToSelect();

        // Initialize Glossary
        renderGlossary();
        if (addGlossaryTermBtn) addGlossaryTermBtn.addEventListener('click', handleAddGlossaryTerm);
        if (glossaryDisplayArea) glossaryDisplayArea.addEventListener('click', (event) => {
            if (event.target.classList.contains('delete-glossary-term-btn')) {
                const termToDelete = event.target.dataset.term;
                if (termToDelete) {
                    handleDeleteGlossaryTerm(termToDelete);
                }
            }
        });

        // Event listener for AI Glossary Generation
        const aiGenerateGlossaryBtn = document.getElementById('ai-generate-glossary-btn');
        if (aiGenerateGlossaryBtn) {
            aiGenerateGlossaryBtn.addEventListener('click', handleAIGlossaryGeneration);
        }

        // Event listener for the new clear output area button
        if (clearOutputAreaBtn) {
            clearOutputAreaBtn.addEventListener('click', () => {
                clearSpecificField('output-box', CONSTANTS.LOCAL_STORAGE_KEYS.OUTPUT_CONTENT, 'output-word-count');
            });
        }

        // Event listener for the main "Reset All" button
        if (clearAllAppBtn) {
            clearAllAppBtn.addEventListener('click', handleResetAllApplicationData);
        }
    } catch (error) {
        console.error('Error initializing event listeners:', error);
        updateStatus('Error initializing application. Check console for details.', CONSTANTS.STATUS_TYPES.ERROR);
    }
    console.info('Application initialization complete.');
});

// Function to insert text at cursor position in a textarea
function insertTextAtCursor(textarea, textToInsert) {
    if (!textarea) return;

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const currentText = textarea.value;

    textarea.value = currentText.substring(0, startPos) + textToInsert + currentText.substring(endPos);

    // Move cursor to after the inserted text
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = startPos + textToInsert.length;

    // Trigger input event for auto-save and word count
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
}

// Event listeners for placeholder buttons - Will be called from main DOMContentLoaded
const setupPlaceholderButtons = () => {
    const placeholderButtonsContainer = document.getElementById('prompt-placeholder-buttons');
    if (placeholderButtonsContainer) {
        const placeholderButtons = placeholderButtonsContainer.querySelectorAll('.placeholder-btn');
        placeholderButtons.forEach(button => {
            button.addEventListener('click', () => {
                const placeholder = button.getAttribute('data-placeholder');
                if (promptBox && placeholder) {
                    insertTextAtCursor(promptBox, placeholder);
                }
            });
        });
    }
};

// ... other event listeners ...

// Remove individual non-debounced input listeners for auto-save, rely on textAreasForAutoSave loop below
// if (promptBox) promptBox.addEventListener('input', () => saveToLocalStorage(CONSTANTS.LOCAL_STORAGE_KEYS.PROMPT_CONTENT, promptBox.value));
// if (notesBox) notesBox.addEventListener('input', () => saveToLocalStorage(CONSTANTS.LOCAL_STORAGE_KEYS.NOTES_CONTENT, notesBox.value));
// if (translationBox) translationBox.addEventListener('input', () => saveToLocalStorage(CONSTANTS.LOCAL_STORAGE_KEYS.TRANSLATION_CONTENT, translationBox.value));

// The direct listener for fandomBox was already commented out, which is correct.
// if (fandomBox) fandomBox.addEventListener('input', () => saveToLocalStorage(CONSTANTS.LOCAL_STORAGE_KEYS.FANDOM_CONTENT, fandomBox.value));

if (sourceLanguageInput) sourceLanguageInput.addEventListener('input', () => saveToLocalStorage(CONSTANTS.LOCAL_STORAGE_KEYS.SOURCE_LANGUAGE, sourceLanguageInput.value));
if (targetLanguageInput) targetLanguageInput.addEventListener('input', () => saveToLocalStorage(CONSTANTS.LOCAL_STORAGE_KEYS.TARGET_LANGUAGE, targetLanguageInput.value)); // Added listener for target language
if (temperatureSlider) temperatureSlider.addEventListener('input', handleTemperatureChange);
if (streamToggle) streamToggle.addEventListener('change', () => saveToLocalStorage(CONSTANTS.LOCAL_STORAGE_KEYS.STREAM_ENABLED, streamToggle.checked));

if (clearInputBtn) clearInputBtn.addEventListener('click', () => clearSpecificField('translation-box', CONSTANTS.LOCAL_STORAGE_KEYS.TRANSLATION_CONTENT, 'input-word-count'));
if (clearOutputAreaBtn) clearOutputAreaBtn.addEventListener('click', () => clearSpecificField('output-box', CONSTANTS.LOCAL_STORAGE_KEYS.OUTPUT_CONTENT, 'output-word-count'));

// Add event listener for the stop button
if (stopBtn) stopBtn.addEventListener('click', stopTranslation);

// --- Functions ---

// Helper function to initialize UI for batch translation
function initializeBatchTranslationUI(totalChunks) {
    if (outputBox) {
        outputBox.innerHTML = ''; // Clear for rich text editor
    }
    if (progressIndicatorContainer) {
        progressIndicatorContainer.innerHTML = `<div>Preparing to translate ${totalChunks} chunks</div>
                                         <div class="progress-bar-bg" style="height: 10px; background: var(--input-bg); border-radius: 5px; margin-top: 8px; overflow: hidden;">
                                            <div class="progress-bar-fg" style="width: 0%; height: 100%; background: var(--primary); border-radius: 5px; transition: width 0.3s ease;"></div>
                                     </div>`;
    }
    updateTranslationState(true); // Set initial translating state for the whole batch
}

// Helper function to update the progress bar UI
function updateProgressIndicatorUI(currentChunkNumber, totalChunks, isErrorOrStopped = false) {
    if (progressIndicatorContainer) {
        const progressPercent = ((currentChunkNumber -1) / totalChunks * 100).toFixed(1);
        let statusMessageText = `Translating chunk ${currentChunkNumber} of ${totalChunks} (${progressPercent}% complete)`;
        let barColor = 'var(--primary)';

        if (isErrorOrStopped) {
            statusMessageText = `Translation stopped at chunk ${currentChunkNumber} of ${totalChunks}`;
            barColor = 'var(--danger)';
        } else if (currentChunkNumber > totalChunks) { // Indicates completion
            statusMessageText = `Translation completed`;
            barColor = 'var(--success)';
        }

        progressIndicatorContainer.innerHTML = `<div>${statusMessageText}</div>
                                         <div class="progress-bar-bg" style="height: 10px; background: var(--input-bg); border-radius: 5px; margin-top: 8px; overflow: hidden;">
                                            <div class="progress-bar-fg" style="width: ${progressPercent}%; height: 100%; background: ${barColor}; border-radius: 5px; transition: width 0.3s ease;"></div>
                                     </div>`;
    }
}

// Word Counter Functionality
function updateWordCount(textElement, countElement) {
    if (!textElement || !countElement) return;
    
    let text = '';
    if (textElement.id === 'output-box') {
        // For rich text editor/contenteditable
        text = textElement.innerText || textElement.textContent || '';
    } else {
        // For regular textarea
        text = textElement.value || '';
    }
    
    // Count words and characters using the CJK-aware getWordCount function
    const words = text.trim() ? getWordCount(text.trim()) : 0;
    const chars = text.length;
    
    // Update the counter display
    countElement.textContent = `${words.toLocaleString()} words | ${chars.toLocaleString()} chars`;
    
    // Add visual indicator for different word count ranges
    countElement.className = 'word-counter';
    if (words > 500) countElement.classList.add('words-500-plus');
    if (words > 1000) countElement.classList.add('words-1000-plus');
    if (words > 3000) countElement.classList.add('words-3000-plus');
    
    // Return the counts for potential other uses
    return { words, chars };
}

// Function to check if API key is present and update UI
function checkApiKey() {
    const selectedModel = modelSelect.value;
    let apiKeyMissing = false;
    let specificMessage = '';

    // Check Grok models
    if (selectedModel.startsWith(CONSTANTS.MODELS.GROK_PREFIX)) {
        if (!grokApiKey || grokApiKey === CONSTANTS.API_KEY_PLACEHOLDERS.GROK) {
            apiKeyMissing = true;
            specificMessage = 'Grok API key is not set. Configure in settings if using Grok.';
        }
    // Check DeepSeek model
    } else if (selectedModel === CONSTANTS.MODELS.DEEPSEEK_CHAT) {
        if (!deepseekApiKey || deepseekApiKey === CONSTANTS.API_KEY_PLACEHOLDERS.DEEPSEEK) {
            apiKeyMissing = true;
            specificMessage = 'DeepSeek API key is not set. Configure in settings if using DeepSeek.';
        }
    // Check OpenRouter models
    } else if (selectedModel.startsWith(CONSTANTS.MODELS.OPENROUTER_PREFIX)) {
        if (!openrouterApiKey || openrouterApiKey === CONSTANTS.API_KEY_PLACEHOLDERS.OPENROUTER) {
            apiKeyMissing = true;
            specificMessage = 'OpenRouter API key is not set. Configure in settings if using OpenRouter models.';
        }
    }

    if (apiKeyMissing) {
        // Update status message to warn about missing API key for the selected model
        updateStatus(specificMessage, CONSTANTS.STATUS_TYPES.WARNING, 10000); // Longer timeout for API key warnings
        if (translateBtn) translateBtn.disabled = true; // Disable translate button
    } else {
        // API key is present for the selected model, ensure translate button is enabled
        if (translateBtn) translateBtn.disabled = false;
        // If a previous API key warning was shown, clear it or set to default status
        if (statusMessage.textContent.includes('API key is not set')) {
            updateStatus(CONSTANTS.UI.DEFAULT_STATUS_MESSAGE, CONSTANTS.STATUS_TYPES.INFO);
        }
    }
}

// Helper function to append summary to a textarea
function appendSummaryToTextarea(textareaElement, summaryText, storageKey, fieldName) {
    if (!textareaElement) {
        console.error(`${fieldName} textarea element not found.`);
        // updateStatus(`Cannot find ${fieldName} input area.`, CONSTANTS.STATUS_TYPES.ERROR);
        return false;
    }
    if (!summaryText || !summaryText.trim()) {
        updateStatus(`No summary text available to add to ${fieldName}.`, CONSTANTS.STATUS_TYPES.INFO);
        return false;
    }

    const currentText = textareaElement.value.trim();
    const summaryHeader = "--- Previous Chapter Summary ---";
    
    // Normalize summaryText to ensure it doesn't already start with the header we are about to add
    let cleanSummaryText = summaryText.trim();
    if (cleanSummaryText.startsWith(summaryHeader)) {
        cleanSummaryText = cleanSummaryText.substring(summaryHeader.length).trim();
    }

    let newTextValue;
    const summaryBlock = `\n\n${summaryHeader}\n${cleanSummaryText}`;

    if (currentText) {
        // If current text already contains a summary block, replace the old summary content.
        const headerIndex = currentText.lastIndexOf(summaryHeader);
        if (headerIndex !== -1) {
            // Assumes the summary is the last major block starting with this header.
            newTextValue = currentText.substring(0, headerIndex).trim() + summaryBlock;
        } else {
            newTextValue = currentText + summaryBlock;
        }
    } else {
        // If textarea is empty, just add the new summary block (trim leading newlines)
        newTextValue = summaryBlock.trimStart(); 
    }
    
    textareaElement.value = newTextValue;

    if (storageKey) {
        saveToLocalStorage(storageKey, textareaElement.value);
    }
    updateStatus(`Summary added/updated in ${fieldName}.`, CONSTANTS.STATUS_TYPES.SUCCESS);
    return true;
}

// Update pricing display based on selected model
function updatePricingDisplay() {
    const selectedModel = modelSelect.value;
    if (!pricingDisplay) return; // Ensure the element exists

    if (modelPricing[selectedModel]) { // For Grok and DeepSeek (hardcoded ones)
        const price = modelPricing[selectedModel];
        pricingDisplay.innerHTML = `Input: ${price.input}/1M tokens, Completion: ${price.completion}/1M tokens, Context: ${price.context}`;
    } else if (selectedModel.startsWith(CONSTANTS.MODELS.OPENROUTER_PREFIX) && openRouterModelData[selectedModel]) {
        // For dynamically loaded OpenRouter models
        const modelData = openRouterModelData[selectedModel];
        const inputCost = modelData.pricing?.input ? `$${parseFloat(modelData.pricing.input).toFixed(2)}` : 'N/A';
        const outputCost = modelData.pricing?.output ? `$${parseFloat(modelData.pricing.output).toFixed(2)}` : 'N/A';
        // Format context length: if it's a large number, show as 'XK' or 'XM'
        let contextWindow = 'N/A';
        if (modelData.context_length) {
            if (modelData.context_length >= 1000000) { // For millions
                contextWindow = `${(modelData.context_length / 1000000).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 1})}M`;
            } else if (modelData.context_length >= 1000) { // For thousands
                 contextWindow = `${(modelData.context_length / 1000).toLocaleString()}k`;
            } else {
                contextWindow = modelData.context_length.toLocaleString(); // For smaller numbers
            }
        }
        pricingDisplay.innerHTML = `Input: ${inputCost}/1M, Output: ${outputCost}/1M, Context: ${contextWindow}`;
    } else if (selectedModel.startsWith(CONSTANTS.MODELS.OPENROUTER_PREFIX)) {
        // This case handles when an OpenRouter model is selected but its data hasn't loaded yet or is missing
        pricingDisplay.innerHTML = 'OpenRouter model: pricing/context info loading or unavailable.';
    } else {
        pricingDisplay.innerHTML = 'Pricing info not available for this model.';
    }
}

// Handle Temperature Slider Change
function handleTemperatureChange() {
    const tempValue = parseFloat(temperatureSlider.value).toFixed(1);
        temperatureValueDisplay.textContent = tempValue;
    saveToLocalStorage(CONSTANTS.LOCAL_STORAGE_KEYS.TEMPERATURE, tempValue);
    console.log(`[Settings] Temperature changed to: ${tempValue}`);
}

// Toggle Dark Mode - REMOVED
// function toggleDarkMode() {
//     document.body.classList.toggle('dark-mode');
//     const isDarkMode = document.body.classList.contains('dark-mode');
//     saveToLocalStorage('darkMode', isDarkMode);
//     // Update icon
//     darkModeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
//     darkModeToggle.title = isDarkMode ? 'Switch to light mode' : 'Switch to dark mode';
// }

// Variables for managing translation state
let translationInProgress = false;
let abortController = null;
let glossaryReplaceActive = false; // Global state for the toggle

// Stop translation function
function stopTranslation() {
    if (abortController) {
        console.log('[Translate] AbortController found, aborting translation...');
        abortController.abort();
        abortController = null;
    }
    updateTranslationState(false);
    updateStatus('Translation stopped.', CONSTANTS.STATUS_TYPES.INFO);
    console.info('[Translate] Translation process stopped by user.');
}

// Update UI based on translation state
function updateTranslationState(isTranslating) {
    translationInProgress = isTranslating;
    
    // Update button states
    translateBtn.disabled = isTranslating;
    if (isTranslating) {
        translateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Translating...';
        stopBtn.style.display = 'inline-block';
    } else {
        translateBtn.innerHTML = '<i class="fas fa-magic"></i> Translate';
        stopBtn.style.display = 'none';
    }
    
    // Optionally disable other controls during translation
    modelSelect.disabled = isTranslating;
    temperatureSlider.disabled = isTranslating;
    // streamToggle.disabled = isTranslating; // Keep stream toggle enabled for chunk-wise decision if needed, or disable too.
}

// Helper function to count words, more accurately for CJK-like languages
function getWordCount(text) {
    if (!text || text.trim() === '') return 0;
    const chineseRegex = /[\u4E00-\u9FFF\u3000-\u303F\uFF00-\uFFEF]/; // Basic CJK, Full-width punctuation
    const hasChinese = chineseRegex.test(text);

    console.log('[getWordCount] Testing text (first 50 chars): ', text.substring(0,50));
    console.log('[getWordCount] Has Chinese characters:', hasChinese);

    if (hasChinese) {
        console.log('[getWordCount] Using CJK counting logic.');
        // For text with Chinese characters, count non-whitespace characters.
        // This treats each Chinese character as a word and ignores spaces.
        return text.replace(/\s+/g, '').length;
    } else {
        console.log('[getWordCount] Using non-CJK (space-splitting) counting logic.');
        // For non-Chinese text, split by spaces and filter out empty strings
        // that might result from multiple spaces.
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }
}

// Function to split text into chunks
async function createTextChunks(text, modelName) {
    console.log(`[Chunker] Creating text chunks for model: ${modelName}`);
    // const DEFAULT_GROK_TOKENS = 22000; // Moved to CONSTANTS
    // const DEFAULT_DEEPSEEK_TOKENS = 6000; // Moved to CONSTANTS
    let chunks = []; 
    let usedTokenizerServer = false;

    let maxTokens;

    if (modelName.startsWith(CONSTANTS.MODELS.GROK_PREFIX)) {
        maxTokens = CONSTANTS.CHUNKING.DEFAULT_GROK_TARGET_TOKENS;
        console.log(`[Chunker] Using Grok model, setting max tokens for chunking to ${maxTokens}`);
    } else if (modelName === CONSTANTS.MODELS.DEEPSEEK_CHAT) {
        maxTokens = CONSTANTS.CHUNKING.DEFAULT_DEEPSEEK_TARGET_TOKENS;
        console.log(`[Chunker] Using DeepSeek model, setting max tokens for chunking to ${maxTokens}`);
    } else if (modelName.startsWith(CONSTANTS.MODELS.OPENROUTER_PREFIX)) {
        maxTokens = CONSTANTS.CHUNKING.DEFAULT_OPENROUTER_TARGET_TOKENS;
        console.log(`[Chunker] Using OpenRouter model (${modelName}), setting max tokens for chunking to ${maxTokens}`);
    } else {
        console.error('[Chunker] Unknown model type for chunking:', modelName);
        // For unknown models, return the original text as a single chunk if it's not empty.
        const trimmedText = text.trim();
        return trimmedText ? [trimmedText] : [];
    }

    if (tokenizerServerUrl) { // Attempt to use server only if URL is configured
    try {
        // Attempt to use the tokenizer server for chunking
            console.log(`[Chunker] Attempting to use tokenizer server at ${tokenizerServerUrl} with max_tokens: ${maxTokens}`);
        const healthResponse = await fetch(`${tokenizerServerUrl}/health`, { 
            method: 'GET' 
        }).catch(error => {
                console.error('[Chunker] Error connecting to tokenizer server (during health check):', error);
                throw new Error('Tokenizer server not reachable or health check fetch failed');
        });

        if (!healthResponse.ok) {
                throw new Error(`Tokenizer server health check failed: ${healthResponse.status} ${await healthResponse.text()}`);
        }

        // If server is available, use it for chunking
        console.log('[Chunker] Tokenizer server is available. Requesting chunking...');
        const chunkResponse = await fetch(`${tokenizerServerUrl}/chunk`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text,
                max_tokens: maxTokens
            })
        });

        if (!chunkResponse.ok) {
            const errorData = await chunkResponse.json().catch(() => ({ error: 'Server returned non-OK status and failed to parse error JSON.' }));
            throw new Error(`Server chunking failed: ${chunkResponse.status} - ${errorData.error || 'Unknown server error'}`);
    }

        const chunkData = await chunkResponse.json();
            chunks = chunkData.chunks; // Assign to the function-scoped chunks variable
            usedTokenizerServer = true;
        
        console.log("[Chunker] Server response summary:", {
            chunks_count: chunkData.chunk_count,
            max_tokens_setting: chunkData.max_tokens_setting,
            actual_tokens: chunkData.actual_total_tokens_in_chunks
        });
        console.log(`[Chunker] Received ${chunks.length} chunks from server`);
        
        if (chunks.length > 0) {
            chunks.forEach((chunk, i) => {
                console.log(`[Chunker] Chunk ${i+1} preview: ${chunk.substring(0, 50)}... (${chunk.length} chars)`);
            });
        }
    } catch (error) {
            console.error('[Chunker] Tokenizer server error (URL was configured, or health/chunk call failed):', error.message);
            // usedTokenizerServer remains false, will fall through to character-based chunking.
        }
    } else {
        console.warn('[Chunker] Tokenizer server URL not configured. Will use character-based fallback.');
    }

    if (!usedTokenizerServer) {
        console.warn('[Chunker] Falling back to character-based chunking. This is a rough approximation!');
        
        chunks = []; 
        // const CHARS_PER_TOKEN_ESTIMATE = 4; // Moved to CONSTANTS
        const maxCharsFallback = maxTokens * CONSTANTS.CHUNKING.CHARS_PER_TOKEN_ESTIMATE;
        let currentChunk = '';
        let accumulatedCharsInCurrentChunk = 0;

        const textLines = text.split(/\r?\n/);
        let paragraphBuffer = [];

        function finalizeCurrentChunk() {
            if (currentChunk.length > 0) {
                chunks.push(currentChunk.trim());
                currentChunk = '';
                accumulatedCharsInCurrentChunk = 0;
            }
        }

        function addParagraphToChunk(pText) {
            if (currentChunk.length > 0) { 
                currentChunk += '\n\n'; 
                accumulatedCharsInCurrentChunk += 2; 
            }
            currentChunk += pText;
            accumulatedCharsInCurrentChunk += pText.length;
        }

        for (const line of textLines) {
            if (line.trim() === '') { 
                if (paragraphBuffer.length > 0) {
                    let currentParagraph = paragraphBuffer.join('\n');
                    paragraphBuffer = [];

                    if (accumulatedCharsInCurrentChunk + currentParagraph.length + (currentChunk.length > 0 ? 2 : 0) > maxCharsFallback && accumulatedCharsInCurrentChunk > 0) {
                        finalizeCurrentChunk();
                    }

                    if (currentParagraph.length > maxCharsFallback && accumulatedCharsInCurrentChunk === 0) {
                        let pToSplit = currentParagraph;
                        while (pToSplit.length > 0) {
                            let subP = pToSplit.substring(0, maxCharsFallback);
                            chunks.push(subP.trim()); 
                            pToSplit = pToSplit.substring(subP.length);
                        }
                    } else if (currentParagraph.length + accumulatedCharsInCurrentChunk + (currentChunk.length > 0 ? 2:0) <= maxCharsFallback) {
                         addParagraphToChunk(currentParagraph);
                    } else {
                         finalizeCurrentChunk();
                         if (currentParagraph.length <= maxCharsFallback) {
                             addParagraphToChunk(currentParagraph);
                         } else { 
                            let pToSplit = currentParagraph;
                            while (pToSplit.length > 0) {
                                let subP = pToSplit.substring(0, maxCharsFallback);
                                chunks.push(subP.trim());
                                pToSplit = pToSplit.substring(subP.length);
                            }
                         }
                    }
                }
            } else {
                paragraphBuffer.push(line);
            }
        }
        
        if (paragraphBuffer.length > 0) {
            let currentParagraph = paragraphBuffer.join('\n');
            if (accumulatedCharsInCurrentChunk + currentParagraph.length + (currentChunk.length > 0 ? 2 : 0) > maxCharsFallback && accumulatedCharsInCurrentChunk > 0) {
                finalizeCurrentChunk();
            }
            if (currentParagraph.length > maxCharsFallback && accumulatedCharsInCurrentChunk === 0) {
                let pToSplit = currentParagraph;
                while (pToSplit.length > 0) {
                    let subP = pToSplit.substring(0, maxCharsFallback);
                    chunks.push(subP.trim()); 
                    pToSplit = pToSplit.substring(subP.length);
                }
            } else if (currentParagraph.length + accumulatedCharsInCurrentChunk + (currentChunk.length > 0 ? 2:0) <= maxCharsFallback) {
                    addParagraphToChunk(currentParagraph);
            } else {
                    finalizeCurrentChunk();
                    if (currentParagraph.length <= maxCharsFallback) {
                        addParagraphToChunk(currentParagraph);
                    } else { 
                    let pToSplit = currentParagraph;
                    while (pToSplit.length > 0) {
                        let subP = pToSplit.substring(0, maxCharsFallback);
                        chunks.push(subP.trim());
                        pToSplit = pToSplit.substring(subP.length);
                    }
                    }
            }
        }

        finalizeCurrentChunk(); 
        console.log(`[Chunker] Fallback created ${chunks.length} chunks based on ~${maxCharsFallback} chars.`);
    }
    
    // Ensure no empty chunks are returned, which can happen if input text is very short or just newlines.
    chunks = chunks.filter(chunk => chunk.trim().length > 0);
    if (chunks.length === 0 && text.trim().length > 0) { // If filtering made chunks empty but original text wasn't
        chunks.push(text.trim()); // Add the original text as one chunk
    }

    // Log chunk stats
    let totalChars = 0;
    let totalWords = 0;
    chunks.forEach((chunk, index) => {
        const chunkWords = getWordCount(chunk);
        totalWords += chunkWords;
        totalChars += chunk.length;
        console.log(`[Chunker] Chunk ${index+1}: ${chunkWords} words, ${chunk.length} chars`);
    });
    console.log(`[Chunker] Total: ${chunks.length} chunks, ${totalWords} words, ${totalChars} chars`);

    return chunks;
}

// Main Translation Handler
async function handleTranslation() {
    console.info('[Translate] Initiating translation process...');
    if (translationInProgress) {
        console.warn('[Translate] Translation already in progress. New request ignored.');
        return;
    }

    const originalSourceText = translationBox.value.trim(); // Use current value, which might have been replaced
    const userPromptTemplate = promptBox.value.trim();
    const fandomContext = fandomBox.value.trim() || CONSTANTS.DEFAULT_VALUES.FANDOM_CONTEXT;
    const notes = notesBox.value.trim() || CONSTANTS.DEFAULT_VALUES.NOTES;
    const selectedModel = modelSelect.value;
    const sourceLanguage = sourceLanguageInput.value.trim() || CONSTANTS.DEFAULT_VALUES.SOURCE_LANGUAGE;
    // targetLanguageInput is a span element, not an input, so use textContent instead of value
    const targetLanguage = targetLanguageInput ? (targetLanguageInput.textContent || 'English') : 'English';
    const temperature = parseFloat(temperatureSlider.value);
    const enableStream = streamToggle.checked;
    const currentSummary = summaryBox ? summaryBox.value.trim() || CONSTANTS.DEFAULT_VALUES.SUMMARY : CONSTANTS.DEFAULT_VALUES.SUMMARY;
    const glossary = getGlossary();
    let formattedGlossary = 'None provided.';
    const termsForPrompt = [];

    if (glossaryReplaceActive) {
        // If replacement is ON, only add Character names to the prompt placeholder
        console.log('[Translate] Glossary replace is ON. Formatting placeholder with Character names only.');
        for (const categoryName in glossary) {
            if (glossary.hasOwnProperty(categoryName) && CHARACTER_GLOSSARY_CATEGORIES.includes(categoryName)) {
                const termsInCategory = glossary[categoryName];
                for (const term in termsInCategory) {
                    if (termsInCategory.hasOwnProperty(term)) {
                        termsForPrompt.push(`${term}: ${termsInCategory[term]}`);
                    }
                }
            }
        }
        if (termsForPrompt.length === 0) {
            formattedGlossary = 'No character names provided in glossary.';
        }
    } else {
        // If replacement is OFF, add all terms to the prompt placeholder
        console.log('[Translate] Glossary replace is OFF. Formatting placeholder with all terms.');
        for (const categoryName in glossary) {
            if (glossary.hasOwnProperty(categoryName)) {
                const termsInCategory = glossary[categoryName];
                for (const term in termsInCategory) {
                    if (termsInCategory.hasOwnProperty(term)) {
                        termsForPrompt.push(`${term}: ${termsInCategory[term]}`);
                    }
                }
            }
        }
    }
    
    if (termsForPrompt.length > 0) {
        formattedGlossary = termsForPrompt.join('\n');
    }
    // If still 'None provided.' (e.g. replace ON and no characters, or replace OFF and empty glossary)
    // formattedGlossary will retain its default or updated 'No character names...' value.

    if (!originalSourceText) {
        updateStatus('Please enter text to translate.', CONSTANTS.STATUS_TYPES.WARNING);
        console.warn('[Translate] No text to translate.');
        return;
    }

    // updateTranslationState(true); // MOVED to initializeBatchTranslationUI
    console.log(`[Translate] Batch translation starting. Model: ${selectedModel}, Source: ${sourceLanguage}, Target: ${targetLanguage}, Temp: ${temperature}, Streaming: ${enableStream}`);
    
    // Clear previous output for the new batch - MOVED to initializeBatchTranslationUI
    // if (outputBox) {
    // outputBox.innerHTML = ''; 
    // if (typeof outputBox.value !== 'undefined') outputBox.value = ''; 
    // }
    // if (progressIndicatorContainer) progressIndicatorContainer.innerHTML = ''; 

    abortController = new AbortController(); // One controller for the whole batch
    let overallSuccess = true;

    try {
        const textChunks = await createTextChunks(originalSourceText, selectedModel);
        if (textChunks.length === 0) {
            updateStatus('No text to translate after processing.', CONSTANTS.STATUS_TYPES.INFO);
            console.warn('[Translate] No translatable chunks found.');
            updateTranslationState(false); // Reset UI if no chunks
            return; 
        }
        
        initializeBatchTranslationUI(textChunks.length); // CALL NEW FUNCTION HERE

        console.log(`[Translate] Text split into ${textChunks.length} chunks for batch processing.`);
        
        // Update progress indicator with total chunks - MOVED to initializeBatchTranslationUI
        // if (progressIndicatorContainer) {
        // progressIndicatorContainer.innerHTML = `<div>Preparing to translate ${textChunks.length} chunks</div>
        // <div class="progress-bar-bg" style="height: 10px; background: var(--input-bg); border-radius: 5px; margin-top: 8px; overflow: hidden;">
        // <div class="progress-bar-fg" style="width: 0%; height: 100%; background: var(--primary); border-radius: 5px; transition: width 0.3s ease;"></div>
        // </div>`;
        // }
        
        let chunkSummaries = []; 
        // Check if inter-chunk summaries are enabled
        const interChunkSummaryToggle = document.getElementById('inter-chunk-summary-toggle');
        const enableInterChunkSummaries = interChunkSummaryToggle ? interChunkSummaryToggle.checked : false;

        for (let i = 0; i < textChunks.length; i++) {
            if (abortController.signal.aborted) {
                console.info('[Translate] Batch translation aborted by user during chunk processing.');
                overallSuccess = false;
                break;
            }

            const chunkTextToTranslate = textChunks[i];
            const chunkNumber = i + 1;
            
            updateProgressIndicatorUI(chunkNumber, textChunks.length);
            
            updateStatus(`Translating chunk ${chunkNumber} of ${textChunks.length}...`, CONSTANTS.STATUS_TYPES.PROCESSING, 0);
            console.log(`[Translate] Processing chunk ${chunkNumber}/${textChunks.length}. Size: ${chunkTextToTranslate.length} chars.`);

            // Add chunk header to output (except for first chunk)
            if (i > 0 || outputBox.innerHTML.length > 0) {
                const chunkDivider = document.createElement('div');
                chunkDivider.className = 'chunk-divider';
                chunkDivider.style.cssText = 'border-top: 2px dashed #45475a; margin: 20px 0; padding-top: 10px;';
                chunkDivider.innerHTML = `<div style="color: #89b4fa; font-weight: bold; margin-bottom: 10px;">Chunk ${chunkNumber} of ${textChunks.length}</div>`;
                outputBox.appendChild(chunkDivider);
            }

            // Process prompt template variables for the current chunk
            let processedChunkPrompt = userPromptTemplate
        .replace(/{source_language}/g, sourceLanguage)
        .replace(/{target_language}/g, targetLanguage)
        .replace(/{fandom_context}/g, fandomContext)
        .replace(/{notes}/g, notes)
                .replace(/{source_text}/g, chunkTextToTranslate) // Use current chunk text
                .replace(/{previous_chapter_summary}/g, currentSummary) // Summary applies to the whole work
                .replace(/{glossary_terms}/g, formattedGlossary); // Inject glossary

            // Add previous chunk summaries if available (for future inter-chunk summary feature)
            if (chunkSummaries.length > 0 && processedChunkPrompt.includes('{previous_chunk_summaries}')) {
                const formattedSummaries = chunkSummaries.map((summary, idx) => 
                    `Chunk ${idx + 1} Summary: ${summary}`
                ).join('\n\n');
                processedChunkPrompt = processedChunkPrompt.replace(/{previous_chunk_summaries}/g, formattedSummaries);
            } else if (processedChunkPrompt.includes('{previous_chunk_summaries}')) {
                processedChunkPrompt = processedChunkPrompt.replace(/{previous_chunk_summaries}/g, 'No previous chunks translated yet.');
            }

            if (!userPromptTemplate.includes('{source_text}') || !processedChunkPrompt.includes(chunkTextToTranslate)) {
                console.warn(`[Translate Chunk ${chunkNumber}] Fallback prompt constructed.`);
    }

            // Create a chunk container for this translation
            const chunkContainer = document.createElement('div');
            chunkContainer.className = 'translation-chunk';
            chunkContainer.dataset.chunkNumber = chunkNumber;
            outputBox.appendChild(chunkContainer);

            let chunkStreamCallback = null;
            let streamBuffer = '';
            let streamUpdateTimer = null;

            function flushStreamBuffer() {
                if (streamBuffer.length > 0) {
                    const formattedText = formatMarkdown(streamBuffer);
                    if (chunkContainer) {
                        chunkContainer.innerHTML += formattedText;
                    } else if (outputBox) { // Fallback if chunkContainer somehow not available
                        outputBox.innerHTML += formattedText;
                    }
                    streamBuffer = ''; // Clear buffer after flushing
                    if (outputBox && outputBox.scrollHeight) {
                        outputBox.scrollTop = outputBox.scrollHeight; // Scroll to bottom
                    }
                }
            }

            if (enableStream) {
                chunkStreamCallback = (text) => {
                    streamBuffer += text;
                    clearTimeout(streamUpdateTimer);
                    streamUpdateTimer = setTimeout(flushStreamBuffer, CONSTANTS.TIMEOUTS.STREAM_BUFFER_FLUSH_INTERVAL);
            };
        }
        
            try {
                const translation = await getTranslation(processedChunkPrompt, selectedModel, temperature, enableStream, chunkStreamCallback, abortController.signal);
                
                // After stream ends (or if not streaming), ensure any remaining buffer is flushed
                if (enableStream) {
                    clearTimeout(streamUpdateTimer); // Clear any pending timer
                    flushStreamBuffer(); // Flush any remaining content
                }
        
                if (abortController.signal.aborted) {
                    overallSuccess = false;
                    break; 
                }

                if (!enableStream) {
                    console.log(`[Translate Chunk ${chunkNumber}] Non-streaming translation received.`);
                    if (chunkContainer) {
                        const formattedTranslation = formatMarkdown(translation);
                        chunkContainer.innerHTML = formattedTranslation;
                    } else if (outputBox) {
                const formattedTranslation = formatMarkdown(translation);
                if (typeof outputBox.innerHTML !== 'undefined') {
                            outputBox.innerHTML += (outputBox.innerHTML.length > 0 ? '<br><br>' : '') + formattedTranslation;
                } else if (typeof outputBox.value !== 'undefined') {
                            outputBox.value += (outputBox.value.length > 0 ? '\n\n' : '') + translation;
                }
            }
        }
        
                console.info(`[Translate Chunk ${chunkNumber}] Translation successful.`);
                 // Update word count after each chunk if not streaming, or finally after all chunks if streaming
                if (!enableStream) {
                    const currentOutputCounter = document.getElementById('output-word-count');
                    if (currentOutputCounter && outputBox) updateWordCount(outputBox, currentOutputCounter);
                }

                // Generate and store summary for inter-chunk context
                if (enableInterChunkSummaries && textChunks.length > 1 && i < textChunks.length -1) { // Only generate if enabled and more chunks to come
                    try {
                        console.log(`[Translate Chunk ${chunkNumber}] Generating summary for inter-chunk context...`);
                        const chunkSummary = await generateChunkSummary(translation, selectedModel, temperature);
                        if (chunkSummary) {
                            chunkSummaries.push(chunkSummary);
                            console.log(`[Translate Chunk ${chunkNumber}] Inter-chunk summary generated and stored: "${chunkSummary}"`);
                        } else {
                            console.warn(`[Translate Chunk ${chunkNumber}] Inter-chunk summary was empty.`);
                        }
                    } catch (summaryError) {
                        console.error(`[Translate Chunk ${chunkNumber}] Failed to generate inter-chunk summary:`, summaryError);
                        // Continue without this summary
                    }
                }

            } catch (chunkError) {
                overallSuccess = false;
                if (chunkError.name === 'AbortError') {
                    console.info(`[Translate Chunk ${chunkNumber}] Aborted by user.`);
                } else {
                    console.error(`[Translate Chunk ${chunkNumber}] Error:`, chunkError);
                    updateStatus(`Error on chunk ${chunkNumber}: ${chunkError.message}`, CONSTANTS.STATUS_TYPES.ERROR, 10000);
                    // Optionally, ask user if they want to continue with next chunk or stop all
                    if (!confirm(`Error translating chunk ${chunkNumber}. Continue with next chunk?`)) {
                        console.warn('[Translate] Batch translation stopped by user after chunk error.');
                        if (abortController) abortController.abort(); // Ensure abort is called
                    }
                }
                if (abortController.signal.aborted) break; // Break outer loop if user chose to stop
            }
        } // End of chunks loop

        updateProgressIndicatorUI(textChunks.length + 1, textChunks.length, !overallSuccess || (abortController && abortController.signal.aborted) );

        if (overallSuccess && !abortController.signal.aborted) {
            updateStatus('All chunks translated successfully!', CONSTANTS.STATUS_TYPES.SUCCESS);
            console.info('[Translate] Batch translation fully successful.');
        } else if (abortController.signal.aborted) {
            updateStatus('Batch translation stopped by user.', CONSTANTS.STATUS_TYPES.INFO);
            // Logged by stopTranslation or within loop
        } else {
            updateStatus('Batch translation completed with some errors.', CONSTANTS.STATUS_TYPES.WARNING);
            console.warn('[Translate] Batch translation completed with errors.');
        }

    } catch (error) {
        // This catch is for errors in createTextChunks or other setup before the loop
        console.error('[Translate] General batch translation error:', error);
        updateStatus('Error in batch translation setup: ' + error.message, CONSTANTS.STATUS_TYPES.ERROR);
        overallSuccess = false;
    } finally {
        console.log('[Translate] Batch translation process finished (finally block).');
        updateTranslationState(false); // Reset UI state for the whole batch process
        // Update final word count for the entire output
        const finalOutputCounter = document.getElementById('output-word-count');
        if (finalOutputCounter && outputBox) updateWordCount(outputBox, finalOutputCounter);

        // Save the final output to localStorage
        if (outputBox) {
            saveToLocalStorage(CONSTANTS.LOCAL_STORAGE_KEYS.OUTPUT_CONTENT, outputBox.innerHTML);
            console.log('[Translate] Final translated output saved to localStorage.');
        }
        
        // Clear progress indicator after a short delay if successful, or keep if stopped/error
        setTimeout(() => {
            if (progressIndicatorContainer && overallSuccess && !abortController.signal.aborted) {
                progressIndicatorContainer.innerHTML = '';
            }
        }, overallSuccess && !abortController.signal.aborted ? 3000 : 0); // Clear after 3s on success, keep if error/stopped or clear immediately if not needed
        
        if (overallSuccess && !abortController.signal.aborted) {
             if (generateSummaryBtn) generateSummaryBtn.disabled = false;
        } else {
            if (generateSummaryBtn) generateSummaryBtn.disabled = true; // Keep disabled if batch had issues or was stopped
        }
        abortController = null; // Clear the controller
    }
}

// New function to generate a summary for a given chunk of text
async function generateChunkSummary(textToSummarize, model, originalTemperature) {
    if (!textToSummarize || !textToSummarize.trim()) {
        console.warn('[ChunkSummary] No text provided to summarize for inter-chunk context.');
        return null;
    }

    console.log(`[ChunkSummary] Requesting summary for chunk. Model: ${model}`);
    const summaryPrompt = `Based on the following text, provide a detailed summary of around 200-500 words. The summary should focus on key plot developments, important character interactions, significant events, and any crucial information that would be essential for maintaining context and continuity if translating the *next* part of this story. Output only the summary itself, without any introductory or concluding remarks:

Text:
${textToSummarize}`;
    
    const summaryTemperature = Math.max(0.1, Math.min(originalTemperature - 0.2, 0.5)); // Lower temp for summary, but not too low

    try {
        // Using the existing getTranslation function for the API call
        const summary = await getTranslation(summaryPrompt, model, summaryTemperature, false, null, abortController ? abortController.signal : null);
        if (summary && summary.trim()) {
            return summary.trim();
        } else {
            console.warn('[ChunkSummary] Received empty summary from AI.');
            return null;
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            console.info('[ChunkSummary] Summary generation aborted.');
        } else {
            console.error('[ChunkSummary] Error during inter-chunk summary generation:', error);
        }
        return null; // Return null if summarization fails or is aborted
    }
}

// Summarization Function
async function handleSummaryGeneration() {
    console.info('[Summary] Initiating summary generation...');
    const translatedText = outputBox.innerText; // Get plain text from the contenteditable div
    const model = modelSelect.value; // Use the same model for consistency, or choose another
    const temperature = 0.5; // Lower temperature for more focused summary

    if (!translatedText.trim()) {
        updateStatus('Nothing to summarize.', CONSTANTS.STATUS_TYPES.INFO);
        console.warn('[Summary] No text to summarize.');
        return;
    }
    console.log(`[Summary] Generating summary using model: ${model}, Temp: ${temperature}`);

    updateStatus('Generating summary...', CONSTANTS.STATUS_TYPES.PROCESSING);
    summaryBox.value = ''; // Clear previous summary
    summaryArea.style.display = 'block'; // Show the summary area
    generateSummaryBtn.disabled = true; // Disable button during generation

    const systemPrompt = "You are an expert summarizer. Create a concise summary of the provided text, focusing on key plot points, character interactions, and context useful for translating the next chapter or section.";
    const userPrompt = `Please summarize the following text:

${translatedText}`;

    try {
        // Combine system prompt and user prompt into a single prompt string
        const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;
        // Fix parameter order: prompt, model, temperature, stream, updateCallback, signal
        const summary = await getTranslation(combinedPrompt, model, temperature, false, null, abortController ? abortController.signal : null);
        summaryBox.value = summary.trim();
        updateStatus('Summary generated.', CONSTANTS.STATUS_TYPES.SUCCESS);
        console.info('[Summary] Summary generation successful.');
    } catch (error) {
        console.error('[Summary] Summary error:', error);
        summaryBox.value = `Error generating summary: ${error.message}`;
        updateStatus('Error generating summary: ' + error.message, CONSTANTS.STATUS_TYPES.ERROR);
    } finally {
        generateSummaryBtn.disabled = false; // Re-enable button
        console.log('[Summary] Summary generation finished (finally block).');
    }
}

// Helper function to get API configuration based on the model
function getApiConfig(model, prompt, temperature, stream) {
    let apiUrl = '';
    let apiKey = '';
    let requestBody = {};

    if (model.startsWith(CONSTANTS.MODELS.GROK_PREFIX)) {
        apiUrl = 'https://api.x.ai/v1/chat/completions';
        apiKey = grokApiKey;
        requestBody = {
            model: model,
            messages: [{ role: "user", content: prompt }],
            temperature: temperature,
            stream: stream,
            max_tokens: CONSTANTS.MODELS.DEFAULT_MAX_OUTPUT_TOKENS_GROK 
        };
    } else if (model === CONSTANTS.MODELS.DEEPSEEK_CHAT) {
        apiUrl = 'https://api.deepseek.com/chat/completions';
        apiKey = deepseekApiKey;
        requestBody = {
            model: model,
            messages: [{ role: "user", content: prompt }],
            temperature: temperature,
            stream: stream,
            max_tokens: CONSTANTS.MODELS.DEFAULT_MAX_OUTPUT_TOKENS_DEEPSEEK 
        };
    } else if (model.startsWith(CONSTANTS.MODELS.OPENROUTER_PREFIX)) {
        apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
        apiKey = openrouterApiKey;
        requestBody = {
            model: model.substring(CONSTANTS.MODELS.OPENROUTER_PREFIX.length), // e.g., "anthropic/claude-3-haiku-20240307"
            messages: [{ role: "user", content: prompt }],
            temperature: temperature,
            stream: stream,
            max_tokens: CONSTANTS.MODELS.DEFAULT_MAX_OUTPUT_TOKENS_OPENROUTER,
            // Optional: OpenRouter specific headers can be added here if needed by their API for routing/tracking
            // route: "fallback", // example, see OpenRouter docs for more
            // headers: {
            //    "HTTP-Referer": "YOUR_SITE_URL", // Replace with your actual site URL
            //    "X-Title": "Fanfic Translator" // Replace with your app name
            // }
        };
    } else {
        throw new Error(`Unsupported model selected: ${model}`);
    }
    return { apiUrl, apiKey, requestBody };
}

// Helper function to process streaming data from the API
async function processStream(response, updateCallback) {
    if (!response.body) {
        throw new Error('ReadableStream not supported in this browser or response body is null.');
    }
    if (typeof updateCallback !== 'function') {
        throw new Error('updateCallback must be a function to process stream data.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let completeTranslation = '';

    console.log('[Stream] Starting to process streaming response');

    while (true) {
        const { value, done } = await reader.read();
        if (done) {
            console.log('[Stream] Stream completed');
            break;
        }
        
        buffer += decoder.decode(value, { stream: true });
        let lines = buffer.split('\n');
        buffer = lines.pop() || ''; 
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine === '' || trimmedLine === 'data: [DONE]') continue;
            
            if (trimmedLine.startsWith('data:')) {
                try {
                    const jsonStr = trimmedLine.substring(5).trim();
                    if (jsonStr && jsonStr !== '[DONE]') {
                        const chunk = JSON.parse(jsonStr);
                        let textChunk = '';
                        if (chunk.choices && chunk.choices[0]) {
                            const choice = chunk.choices[0];
                            if (choice.delta && choice.delta.content) {
                                textChunk = choice.delta.content;
                                // console.log('[Stream] Received chunk:', textChunk); // Can be too spammy
                            } else if (choice.text) {
                                textChunk = choice.text;
                            } else if (choice.message && choice.message.content) {
                                textChunk = choice.message.content;
                            }
                        }
                        if (textChunk) {
                            completeTranslation += textChunk;
                            updateCallback(textChunk);
                        }
                    }
                } catch (e) {
                    console.error('Error parsing stream chunk:', e, 'Line:', trimmedLine);
                }
            }
        }
    }
    
    // Final decode for any remaining buffer content (should ideally be empty if stream ends cleanly)
    if (buffer) {
        const remainingText = decoder.decode(); // No arguments needed for final decode
        if (remainingText) {
            completeTranslation += remainingText;
            updateCallback(remainingText);
        }
    }
    return completeTranslation;
}

async function getTranslation(prompt, model, temperature, stream = false, updateCallback = null, signal = null) {
    // Basic check for prompt and model
    if (!prompt || !model) {
        throw new Error('Missing required parameters for getTranslation (prompt or model).');
    }

    const { apiUrl, apiKey, requestBody } = getApiConfig(model, prompt, temperature, stream);

    if (!apiKey || 
        (model.startsWith(CONSTANTS.MODELS.GROK_PREFIX) && apiKey === CONSTANTS.API_KEY_PLACEHOLDERS.GROK) || 
        (model === CONSTANTS.MODELS.DEEPSEEK_CHAT && apiKey === CONSTANTS.API_KEY_PLACEHOLDERS.DEEPSEEK) ||
        (model.startsWith(CONSTANTS.MODELS.OPENROUTER_PREFIX) && apiKey === CONSTANTS.API_KEY_PLACEHOLDERS.OPENROUTER)) {
        let specificKeyError = "API key not set.";
        if (model.startsWith(CONSTANTS.MODELS.GROK_PREFIX)) specificKeyError = "Grok API key not set.";
        else if (model === CONSTANTS.MODELS.DEEPSEEK_CHAT) specificKeyError = "DeepSeek API key not set.";
        else if (model.startsWith(CONSTANTS.MODELS.OPENROUTER_PREFIX)) specificKeyError = "OpenRouter API key not set.";
        throw new Error(`API key is not set properly. ${specificKeyError} Please check the API key configuration.`);
    }

    const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
    };

    // Add OpenRouter specific headers if applicable
    if (model.startsWith(CONSTANTS.MODELS.OPENROUTER_PREFIX)) {
        // headers['HTTP-Referer'] = 'YOUR_SITE_URL'; // Replace with your actual site URL or a variable
        // headers['X-Title'] = 'Fanfic Translator'; // Replace with your app name or a variable
    }

    console.log(`Sending ${stream ? 'streaming' : 'non-streaming'} request to ${apiUrl} for model ${model}. Body hidden for brevity if large.`);
    // To log the full body for debugging, uncomment the next line and comment out the one above.
    // console.log(`Sending ${stream ? 'streaming' : 'non-streaming'} request to ${apiUrl} for model ${model} with body:`, requestBody);

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody),
            signal: signal
        });

        if (!response.ok) {
            // Use handleApiError to process and throw a formatted error
            await handleApiError(response, model); // Pass model for context in error message
            // handleApiError should throw, so this next line might not be reached,
            // but as a fallback if it were to return an error message instead:
            // throw new Error('API request failed after processing with handleApiError.'); 
        }
        console.log(`[API] Request to ${apiUrl} for model ${model} returned status: ${response.status}`);

        if (stream && updateCallback) {
            return await processStream(response, updateCallback);
        } else {
            const data = await response.json();
            if (data.choices && data.choices[0] && data.choices[0].message && typeof data.choices[0].message.content !== 'undefined') {
                return data.choices[0].message.content;
            } else {
                console.error("Invalid API response format for non-streaming:", data);
                throw new Error('Invalid API response format for non-streaming translation.');
            }
        }
    } catch (error) {
        console.error(`Error in getTranslation for model ${model}:`, error.message);
        if (error.name === 'AbortError') {
            throw error; // Re-throw AbortError to be handled specifically by the caller
        }
        // Re-throw other errors, potentially already formatted by handleApiError or new ones from this function
        throw new Error(`Translation attempt failed for model ${model}. Reason: ${error.message}`);
    }
}

// Helper function to handle API errors
async function handleApiError(response, modelName = 'selected') { // Added modelName for context
    let errorData;
    let errorMessage;
    try {
        errorData = await response.json();
        errorMessage = errorData?.error?.message || errorData?.detail || response.statusText || 'Unknown API error';
    } catch (e) {
        // If parsing JSON fails, use the raw text
        const rawText = await response.text().catch(() => response.statusText); // Fallback for text() error
        errorMessage = rawText || response.statusText || 'Unknown error and failed to get details';
        updateStatus(`API Error (${response.status}) with ${modelName} model. Response: ${errorMessage}`, CONSTANTS.STATUS_TYPES.ERROR, 10000);
        console.error(`API Error (${response.status}) with ${modelName} model. Raw response:`, rawText);
        throw new Error(`API Error (${response.status}) with ${modelName} model: ${errorMessage}`); // Throw after logging
    }
    
    updateStatus(`API Error (${response.status}) with ${modelName} model: ${errorMessage}`, CONSTANTS.STATUS_TYPES.ERROR, 10000);
    console.error('API Error Data:', errorData);
    throw new Error(`API Error (${response.status}) with ${modelName} model: ${errorMessage}`); // Ensure an error is thrown
}

// Clear specific field, its local storage, and optionally update its word count
function clearSpecificField(elementId, storageKey, wordCountElementId = null) {
    if (!confirm(`Are you sure you want to clear the ${elementId.replace('-box', '').replace('-', ' ')} field?`)) {
        updateStatus(`${elementId.replace('-box','').replace('-', ' ')} clearing cancelled.`, CONSTANTS.STATUS_TYPES.INFO);
        return;
    }

    const element = document.getElementById(elementId);
    if (element) {
        if (elementId === 'output-box') { // Simplified condition
            element.innerHTML = '';
        } else {
            element.value = '';
        }
        if (storageKey) {
            localStorage.removeItem(storageKey);
            console.log(`[ClearField] Cleared ${elementId} and removed ${storageKey} from localStorage.`);
        }
        updateStatus(`${elementId.replace('-box','').replace('-',' ')} cleared.`, CONSTANTS.STATUS_TYPES.INFO);

        if (wordCountElementId) {
            const wordCountElement = document.getElementById(wordCountElementId);
            const sourceElementForCount = document.getElementById(elementId); // Re-fetch to be safe, or pass element
            if (wordCountElement && sourceElementForCount) {
                updateWordCount(sourceElementForCount, wordCountElement);
            }
        }
    } else {
        console.warn(`Element with ID ${elementId} not found for clearing.`);
    }
}

// Clear Prompt, Fandom, Notes fields
function clearContextualFields() { // Renamed function
    if (!confirm('Are you sure you want to clear the Prompt, Fandom Context, and Notes fields? The prompt will be reset to default.')) {
        updateStatus('Clearing contextual fields cancelled.', CONSTANTS.STATUS_TYPES.INFO);
        return;
    }
    console.info('[ClearContextual] Clearing prompt, fandom, and notes fields.');
    promptBox.value = '';
    fandomBox.value = '';
    notesBox.value = '';

    // Reset relevant local storage
    localStorage.removeItem(CONSTANTS.LOCAL_STORAGE_KEYS.PROMPT_CONTENT);
    localStorage.removeItem(CONSTANTS.LOCAL_STORAGE_KEYS.FANDOM_CONTENT);
    localStorage.removeItem(CONSTANTS.LOCAL_STORAGE_KEYS.NOTES_CONTENT);

    // For now, keep model, temp, source lang, theme
    promptBox.value = defaultPromptTemplate; // Reset prompt to default
    saveToLocalStorage(CONSTANTS.LOCAL_STORAGE_KEYS.PROMPT_CONTENT, defaultPromptTemplate);
    // Corrected console log to match the function name
    console.log('[ClearContextual] Prompt, Fandom, Notes fields cleared and prompt reset to default.'); 

    updateStatus('Prompt, Fandom, and Notes fields cleared.', CONSTANTS.STATUS_TYPES.INFO);
}

function handleResetAllApplicationData() {
    console.warn('[ResetAllApp] User initiated full application data reset.');
    if (confirm('Are you sure you want to reset ALL application data? This includes text, settings, and API keys.')) {
        console.log('[ResetAllApp] User confirmed full reset.');
        // Clear all known local storage items for this app
        for (const key in CONSTANTS.LOCAL_STORAGE_KEYS) {
            if (CONSTANTS.LOCAL_STORAGE_KEYS.hasOwnProperty(key)) {
                localStorage.removeItem(CONSTANTS.LOCAL_STORAGE_KEYS[key]);
                console.log(`[ResetAllApp] Removed ${CONSTANTS.LOCAL_STORAGE_KEYS[key]} from localStorage.`);
            }
        }

        // Also clear API keys from memory
        grokApiKey = '';
        deepseekApiKey = '';
        openrouterApiKey = ''; // Clear OpenRouter API key

        // Reload the page to apply defaults and clear state thoroughly
        updateStatus('Application data reset. Reloading page...', CONSTANTS.STATUS_TYPES.SUCCESS, 2000);
        console.log('[ResetAllApp] Reloading page to apply reset.');
        setTimeout(() => {
            window.location.reload();
        }, 2000); // Give user time to see the status message
    } else {
        console.info('[ResetAllApp] Full application data reset cancelled by user.');
        updateStatus('Application reset cancelled.', CONSTANTS.STATUS_TYPES.INFO);
    }
}

// Save content of a specific textarea or rich text editor to a .txt file
function saveTextAsFile(elementId, filename) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with ID ${elementId} not found for saving.`);
        updateStatus(`Error: Could not find element ${elementId}`, CONSTANTS.STATUS_TYPES.ERROR);
        return;
    }
    
    // Get text content - handle both textareas and rich text editors
    let text;
    if (elementId === 'output-box') {
        // For rich text editor - get plain text
        text = element.innerText || element.textContent;
    } else {
        // For regular textareas
        text = element.value;
    }
    
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href); // Clean up

    // Provide feedback on the button that triggered the save
    const saveButton = document.querySelector(`button[data-target="${elementId}"]`);
    if (saveButton) {
        const originalButtonText = saveButton.innerHTML;
        saveButton.innerHTML = '<i class="fas fa-check"></i> Saved!';
        saveButton.disabled = true;
        setTimeout(() => {
            saveButton.innerHTML = originalButtonText;
            saveButton.disabled = false;
        }, 2000);
    }
}

// Save all files as a ZIP file
async function saveAllAsZip() {
    // Check if JSZip is loaded
    if (typeof JSZip === 'undefined') {
        updateStatus('Error: JSZip library not loaded. Cannot save as ZIP.', CONSTANTS.STATUS_TYPES.ERROR);
        console.error('[ZIP] JSZip is not defined. Make sure the library is included in index.html.');
        return;
    }
    console.info('[ZIP] Initiating save all as ZIP...');

    try {
        const zip = new JSZip();
        zip.file("source_text.txt", translationBox.value);
        zip.file("prompt_template.txt", promptBox.value);
        zip.file("fandom_context.txt", fandomBox.value);
        zip.file("notes.txt", notesBox.value);
        zip.file("translated_output.txt", outputBox.innerText); // Changed from outputBox.value
        // Include settings
        const settings = {
            model: modelSelect.value,
            source_language: sourceLanguageInput.value,
            temperature: temperatureSlider.value,
            timestamp: new Date().toISOString()
        };
        zip.file("settings.json", JSON.stringify(settings, null, 2));

        zip.generateAsync({ type: "blob" })
            .then(function(content) {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(content);
                link.download = `fanfic_translation_${new Date().toISOString().split('T')[0]}.zip`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                updateStatus('All files and settings saved as ZIP.', CONSTANTS.STATUS_TYPES.SUCCESS);
                console.info('[ZIP] Successfully generated and downloaded ZIP file.');
            })
            .catch(err => {
                console.error("[ZIP] Error generating ZIP blob:", err);
                updateStatus('Error generating ZIP file.', CONSTANTS.STATUS_TYPES.ERROR);
            });
    } catch (err) {
        console.error("[ZIP] Error creating ZIP object:", err);
        updateStatus('Error preparing ZIP file.', CONSTANTS.STATUS_TYPES.ERROR);
    }
}

// Copy text from output box to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Success feedback is handled by the caller
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        updateStatus('Failed to copy text', CONSTANTS.STATUS_TYPES.ERROR);
    });
}

// Save data to local storage
function saveToLocalStorage(key, value) {
    // Check if this key should be project-scoped
    const isGlobalKey = CONSTANTS.PROJECT_STORAGE.GLOBAL_KEYS.includes(key);
    const storageKey = isGlobalKey ? key : ProjectManager.getScopedKey(key);
    
    const valueToStore = typeof value === 'boolean' ? String(value) : value;
    try {
        localStorage.setItem(storageKey, valueToStore);
        // Avoid logging the actual value for potentially large content like promptContent or translationContent
        if (key === CONSTANTS.LOCAL_STORAGE_KEYS.GROK_API_KEY || key === CONSTANTS.LOCAL_STORAGE_KEYS.DEEPSEEK_API_KEY || key === CONSTANTS.LOCAL_STORAGE_KEYS.OPENROUTER_API_KEY) {
            console.log(`[LocalStorage] Saved ${storageKey}: (API key - value not logged)`);
        } else if (valueToStore && valueToStore.length > 100) { // Heuristic for large content
            console.log(`[LocalStorage] Saved ${storageKey}: (large content - value not logged, length: ${valueToStore.length})`);
        } else {
            console.log(`[LocalStorage] Saved ${storageKey}: ${valueToStore}`);
        }
    } catch (e) {
        console.error(`[LocalStorage] Error saving ${storageKey} to localStorage:`, e);
        updateStatus('Warning: Could not save data to local storage. It might be full.', CONSTANTS.STATUS_TYPES.WARNING);
    }
}

function loadFromLocalStorage() {
    try {
        console.info('[LocalStorage] Starting to load data from local storage.');
        document.body.classList.add('dark-mode'); // Ensure dark mode is always on

        // Load global settings (API keys)
        let loadedGrokKey = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_KEYS.GROK_API_KEY) || ''; 
        let loadedDeepSeekKey = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_KEYS.DEEPSEEK_API_KEY) || '';
        let loadedOpenrouterKey = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_KEYS.OPENROUTER_API_KEY) || ''; // Load OpenRouter key
        grokApiKey = loadedGrokKey;
        deepseekApiKey = loadedDeepSeekKey;
        openrouterApiKey = loadedOpenrouterKey; // Assign OpenRouter key
        console.log('[LocalStorage] API Keys loaded (values not displayed).');

        // Helper function to get the project-scoped key
        const getStorageKey = (key) => {
            const isGlobalKey = CONSTANTS.PROJECT_STORAGE.GLOBAL_KEYS.includes(key);
            return isGlobalKey ? key : ProjectManager.getScopedKey(key);
        };

        // Modal Elements
        const apiSettingsModal = document.getElementById('api-settings-modal');
        const apiSettingsBtn = document.getElementById('api-settings-btn'); // This is likely the one in the old settings card
        const closeApiModalBtn = document.getElementById('close-api-modal');
        const saveApiKeysBtn = document.getElementById('save-api-keys');
        const grokApiKeyInput = document.getElementById('grok-api-key');
        const deepseekApiKeyInput = document.getElementById('deepseek-api-key');
        const openrouterApiKeyInputFromModal = document.getElementById('openrouter-api-key'); // Get new input from modal
        const headerApiBtn = document.getElementById('api-keys-btn'); // This is the button in the main app header

        let focusedElementBeforeModal = null; // To store focus before modal opens

        function initApiModalInternal() {
            if (!apiSettingsModal) return; // Do nothing if modal element doesn't exist

            if (grokApiKeyInput) grokApiKeyInput.value = grokApiKey;
            if (deepseekApiKeyInput) deepseekApiKeyInput.value = deepseekApiKey;
            if (openrouterApiKeyInputFromModal) openrouterApiKeyInputFromModal.value = openrouterApiKey; // Populate OpenRouter key
            
            const openModalButtons = [];
            // Check if these buttons exist before adding listeners
            if (apiSettingsBtn) openModalButtons.push(apiSettingsBtn); // Button from old settings card location
            if (headerApiBtn) openModalButtons.push(headerApiBtn);   // Button from top app header

            openModalButtons.forEach(button => {
                button.addEventListener('click', () => {
                    focusedElementBeforeModal = document.activeElement; // Store focus
                    apiSettingsModal.style.display = 'flex';
                    if (grokApiKeyInput) grokApiKeyInput.focus(); // Focus first input
                });
            });
            
            const closeModal = () => {
                apiSettingsModal.style.display = 'none';
                if (focusedElementBeforeModal) focusedElementBeforeModal.focus(); // Restore focus
            };

            if (closeApiModalBtn) closeApiModalBtn.addEventListener('click', closeModal);
            
            window.addEventListener('click', (e) => {
                if (e.target === apiSettingsModal) {
                    closeModal();
                }
            });

            // Basic focus trapping
            apiSettingsModal.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    closeModal();
                }
                if (e.key === 'Tab') {
                    const focusableElements = Array.from(apiSettingsModal.querySelectorAll('button, input, select, textarea, [tabindex]:not([tabindex="-1"])'));
                    const firstElement = focusableElements[0];
                    const lastElement = focusableElements[focusableElements.length - 1];

                    if (e.shiftKey) { // Shift + Tab
                        if (document.activeElement === firstElement) {
                            lastElement.focus();
                            e.preventDefault();
                        }
                    } else { // Tab
                        if (document.activeElement === lastElement) {
                            firstElement.focus();
                            e.preventDefault();
                        }
                    }
                }
            });
            
            if (saveApiKeysBtn) saveApiKeysBtn.addEventListener('click', () => {
                let currentGrokKey = grokApiKeyInput ? grokApiKeyInput.value.trim() : '';
                let currentDeepSeekKey = deepseekApiKeyInput ? deepseekApiKeyInput.value.trim() : '';
                let currentOpenrouterKey = openrouterApiKeyInputFromModal ? openrouterApiKeyInputFromModal.value.trim() : ''; // Get OpenRouter key
                
                localStorage.setItem(CONSTANTS.LOCAL_STORAGE_KEYS.GROK_API_KEY, currentGrokKey);
                localStorage.setItem(CONSTANTS.LOCAL_STORAGE_KEYS.DEEPSEEK_API_KEY, currentDeepSeekKey);
                localStorage.setItem(CONSTANTS.LOCAL_STORAGE_KEYS.OPENROUTER_API_KEY, currentOpenrouterKey); // Save OpenRouter key
                grokApiKey = currentGrokKey;
                deepseekApiKey = currentDeepSeekKey;
                openrouterApiKey = currentOpenrouterKey; // Assign OpenRouter key to global variable
                
                if (apiSettingsModal) apiSettingsModal.style.display = 'none';
                updateStatus('API keys saved successfully', CONSTANTS.STATUS_TYPES.SUCCESS);
                console.log('[APIKeys] API keys saved via modal.');
                checkApiKey(); 
            });
        }

        if (apiSettingsModal) { // Only initialize if the modal itself exists
            initApiModalInternal();
        }

        if (grokApiKeyInput) grokApiKeyInput.value = grokApiKey;
        if (deepseekApiKeyInput) deepseekApiKeyInput.value = deepseekApiKey;
        if (openrouterApiKeyInput) openrouterApiKeyInput.value = openrouterApiKey; // Populate OpenRouter input (if it's the global one)

        // Load project-scoped content
        if (translationBox) {
            const key = getStorageKey(CONSTANTS.LOCAL_STORAGE_KEYS.TRANSLATION_CONTENT);
            translationBox.value = localStorage.getItem(key) || '';
        }
        
        if (promptBox) {
            const key = getStorageKey(CONSTANTS.LOCAL_STORAGE_KEYS.PROMPT_CONTENT);
            promptBox.value = localStorage.getItem(key) || defaultPromptTemplate;
        }
        
        if (notesBox) {
            const key = getStorageKey(CONSTANTS.LOCAL_STORAGE_KEYS.NOTES_CONTENT);
            notesBox.value = localStorage.getItem(key) || '';
        }
        
        if (fandomBox) {
            const key = getStorageKey(CONSTANTS.LOCAL_STORAGE_KEYS.FANDOM_CONTENT);
            fandomBox.value = localStorage.getItem(key) || '';
        }
        
        const savedOutput = localStorage.getItem(getStorageKey(CONSTANTS.LOCAL_STORAGE_KEYS.OUTPUT_CONTENT)) || '';
        if (outputBox) outputBox.innerHTML = savedOutput || '';

        const savedStream = localStorage.getItem(getStorageKey(CONSTANTS.LOCAL_STORAGE_KEYS.STREAM_ENABLED));
        if (streamToggle) streamToggle.checked = savedStream === 'true';

        const savedModel = localStorage.getItem(getStorageKey(CONSTANTS.LOCAL_STORAGE_KEYS.SELECTED_MODEL));
        if (modelSelect && savedModel) modelSelect.value = savedModel;

        const savedInterChunkSummaryEnabled = localStorage.getItem(getStorageKey(CONSTANTS.LOCAL_STORAGE_KEYS.INTER_CHUNK_SUMMARY_ENABLED));
        const interChunkSummaryToggle = document.getElementById('inter-chunk-summary-toggle');
        if (interChunkSummaryToggle) interChunkSummaryToggle.checked = savedInterChunkSummaryEnabled === 'true'; // Default to false if not found

        const savedSourceLang = localStorage.getItem(getStorageKey(CONSTANTS.LOCAL_STORAGE_KEYS.SOURCE_LANGUAGE));
        if (sourceLanguageInput) {
            sourceLanguageInput.value = savedSourceLang || CONSTANTS.DEFAULT_VALUES.SOURCE_LANGUAGE;
        }

        const savedTargetLang = localStorage.getItem(getStorageKey(CONSTANTS.LOCAL_STORAGE_KEYS.TARGET_LANGUAGE));
        if (targetLanguageInput) {
            targetLanguageInput.value = savedTargetLang || 'English'; // Default to English if not found
        }

        const savedTemperature = localStorage.getItem(getStorageKey(CONSTANTS.LOCAL_STORAGE_KEYS.TEMPERATURE));
        if (temperatureSlider) {
            temperatureSlider.value = savedTemperature || CONSTANTS.DEFAULT_VALUES.TEMPERATURE;
        }
        handleTemperatureChange(); // This will also log the temperature change
        updatePricingDisplay();
        renderGlossary(); // Render glossary on load
        loadSavedPromptTemplatesToSelect(); // Load saved prompts
        
        console.info('[LocalStorage] Finished loading data from local storage.');
        updateStatus('Loaded project data from local storage.', CONSTANTS.STATUS_TYPES.INFO, CONSTANTS.TIMEOUTS.STATUS_LOADED_SESSION);
        
        // Initial word counts after loading from local storage
        if (translationBox && document.getElementById('input-word-count')) {
            updateWordCount(translationBox, document.getElementById('input-word-count'));
        }
        if (outputBox && document.getElementById('output-word-count')) {
            updateWordCount(outputBox, document.getElementById('output-word-count'));
        }
        updateTokenCountAndCost(); // Initial call on load

        // Load and set glossary replace toggle state
        const glossaryReplaceToggleElement = document.getElementById('glossary-replace-toggle');
        if (glossaryReplaceToggleElement) {
            const savedReplaceToggle = localStorage.getItem(getStorageKey(CONSTANTS.LOCAL_STORAGE_KEYS.GLOSSARY_REPLACE_TOGGLE));
            glossaryReplaceActive = savedReplaceToggle === 'true';
            glossaryReplaceToggleElement.checked = glossaryReplaceActive;
            console.log(`[GlossaryReplace] Initial toggle state: ${glossaryReplaceActive}`);
            
            glossaryReplaceToggleElement.addEventListener('change', () => {
                glossaryReplaceActive = glossaryReplaceToggleElement.checked;
                saveToLocalStorage(CONSTANTS.LOCAL_STORAGE_KEYS.GLOSSARY_REPLACE_TOGGLE, glossaryReplaceActive);
                console.log(`[GlossaryReplace] Toggle changed to: ${glossaryReplaceActive}`);
                if (glossaryReplaceActive) {
                    debouncedHandleReplaceInInput(true); // Force replace when toggled on
                } else {
                    // Optional: Add logic here if something needs to happen when toggled OFF
                    // For now, toggling off just stops future auto-replacements.
                    // The original text is not restored automatically.
                    updateStatus('Glossary auto-replace OFF. Manual prompt placeholder will use all terms.', CONSTANTS.STATUS_TYPES.INFO);
                }
            });
        }

    } catch (error) {
        console.error("[LocalStorage] Error during loadFromLocalStorage:", error);
        updateStatus("Could not load settings from local storage. It might be disabled or inaccessible.", CONSTANTS.STATUS_TYPES.ERROR, 0);
        // Apply critical defaults if local storage fails catastrophically
        if (promptBox) promptBox.value = defaultPromptTemplate;
        if (modelSelect) modelSelect.value = 'grok-3-latest'; // A sensible default model
    }
}

// Format markdown to HTML for rich text display
function formatMarkdown(text) {
    if (!text) return '';
    
    // First handle any literal HTML tags that might be in the response
    let formatted = text
        // Replace common literal HTML tags with placeholders
        .replace(/<br>/gi, '###LINEBREAK###')
        .replace(/<\/br>/gi, '###LINEBREAKEND###')
        .replace(/<b>/gi, '###BOLD###')
        .replace(/<\/b>/gi, '###BOLDEND###')
        .replace(/<i>/gi, '###ITALIC###')
        .replace(/<\/i>/gi, '###ITALICEND###')
        .replace(/<strong>/gi, '###STRONG###')
        .replace(/<\/strong>/gi, '###STRONGEND###')
        .replace(/<em>/gi, '###EM###')
        .replace(/<\/em>/gi, '###EMEND###')
        .replace(/<ul>/gi, '###UL###')
        .replace(/<\/ul>/gi, '###ULEND###')
        .replace(/<li>/gi, '###LI###')
        .replace(/<\/li>/gi, '###LIEND###')
        // Escape HTML tags for security
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        // Restore HTML tags from placeholders
        .replace(/###LINEBREAK###/gi, '<br>')
        .replace(/###LINEBREAKEND###/gi, '</br>')
        .replace(/###BOLD###/gi, '<b>')
        .replace(/###BOLDEND###/gi, '</b>')
        .replace(/###ITALIC###/gi, '<i>')
        .replace(/###ITALICEND###/gi, '</i>')
        .replace(/###STRONG###/gi, '<strong>')
        .replace(/###STRONGEND###/gi, '</strong>')
        .replace(/###EM###/gi, '<em>')
        .replace(/###EMEND###/gi, '</em>')
        .replace(/###UL###/gi, '<ul>')
        .replace(/###ULEND###/gi, '</ul>')
        .replace(/###LI###/gi, '<li>')
        .replace(/###LIEND###/gi, '</li>');
    
    // Process markdown formatting
    formatted = formatted
        // Convert markdown bold/italic
        .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>') // Bold + italic
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
        .replace(/__(.*?)__/g, '<strong>$1</strong>') // Bold alternative
        .replace(/_(.*?)_/g, '<em>$1</em>') // Italic alternative
        
        // Headers
        .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
        .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
        .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
        
        // Line breaks
        .replace(/\n/g, '<br>')
        
        // Lists
        .replace(/^\* (.*?)$/gm, '<li>$1</li>')
        .replace(/^\- (.*?)$/gm, '<li>$1</li>')
        .replace(/^\d+\. (.*?)$/gm, '<li>$1</li>');
    
    // Wrap lists in <ul> or <ol> tags if needed
    // (This is a simplified approach)
    if (formatted.includes('<li>') && !formatted.includes('<ul>')) {
        formatted = formatted.replace(/(<li>.*?<\/li>)+/g, '<ul>$&</ul>');
    }
    
    return formatted;
}

// Update status message
function updateStatus(message, type = CONSTANTS.STATUS_TYPES.INFO, timeout = CONSTANTS.TIMEOUTS.STATUS_MESSAGE_DEFAULT) {
    if (statusMessage) { // Ensure statusMessage element exists
        statusMessage.textContent = message;
        statusMessage.classList.remove(CONSTANTS.STATUS_TYPES.INFO, CONSTANTS.STATUS_TYPES.SUCCESS, CONSTANTS.STATUS_TYPES.ERROR, CONSTANTS.STATUS_TYPES.PROCESSING);
        if (type) {
            statusMessage.classList.add(type);
        }

        if (type === CONSTANTS.STATUS_TYPES.SUCCESS || type === CONSTANTS.STATUS_TYPES.INFO) {
            setTimeout(() => {
                if (statusMessage.textContent === message) {
                    statusMessage.textContent = CONSTANTS.UI.DEFAULT_STATUS_MESSAGE;
                    statusMessage.classList.remove(type);
                    statusMessage.classList.add(CONSTANTS.STATUS_TYPES.INFO);
                }
            }, timeout);
        }
    }
}

// Automatically save changes in text areas to localStorage after a short delay
// Ensure fandomBox is part of this array for debounced auto-save
const textAreasForAutoSave = [translationBox, promptBox, notesBox, fandomBox]; 
let saveTimeout;

// Map textareas to their storage keys for auto-save
const textAreaStorageMap = {
    'translation-box': CONSTANTS.LOCAL_STORAGE_KEYS.TRANSLATION_CONTENT,
    'prompt-box': CONSTANTS.LOCAL_STORAGE_KEYS.PROMPT_CONTENT,
    'notes-box': CONSTANTS.LOCAL_STORAGE_KEYS.NOTES_CONTENT,
    'fandom-box': CONSTANTS.LOCAL_STORAGE_KEYS.FANDOM_CONTENT 
};

textAreasForAutoSave.forEach(textarea => {
    if (textarea) { 
        textarea.addEventListener('input', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                const storageKey = textAreaStorageMap[textarea.id];
                if (storageKey) {
                    saveToLocalStorage(storageKey, textarea.value);
                }
            }, CONSTANTS.TIMEOUTS.AUTO_SAVE_DEBOUNCE); 
        });
    }
});

// The redundant saveFandomContent() function was removed in a previous step.

// --- Prompt Template Management Functions ---
function getSavedPrompts() {
    try {
        const storageKey = ProjectManager.getScopedKey(CONSTANTS.LOCAL_STORAGE_KEYS.SAVED_PROMPTS);
        const savedPromptsJson = localStorage.getItem(storageKey);
        return savedPromptsJson ? JSON.parse(savedPromptsJson) : {};
    } catch (error) {
        console.error('[Prompts] Error loading saved prompts:', error);
        return {};
    }
}

function savePromptsToStorage(prompts) {
    try {
        const storageKey = ProjectManager.getScopedKey(CONSTANTS.LOCAL_STORAGE_KEYS.SAVED_PROMPTS);
        localStorage.setItem(storageKey, JSON.stringify(prompts));
        console.log('[Prompts] Saved prompts to localStorage.');
    } catch (error) {
        console.error('[Prompts] Error saving prompts:', error);
        updateStatus('Error saving prompts. They might be too large for localStorage.', CONSTANTS.STATUS_TYPES.ERROR);
    }
}

function loadSavedPromptTemplatesToSelect() {
    if (!savedPromptsSelect) {
        console.error('[Prompts] Saved prompts select element not found');
        return;
    }

    // Clear existing options
    while (savedPromptsSelect.options.length > 1) {
        savedPromptsSelect.remove(1);
    }

    try {
        const storageKey = ProjectManager.getScopedKey(CONSTANTS.LOCAL_STORAGE_KEYS.SAVED_PROMPTS);
        const savedPromptsJson = localStorage.getItem(storageKey);
        if (!savedPromptsJson) {
            console.log('[Prompts] No saved prompts found in localStorage');
            return;
        }

        const savedPrompts = JSON.parse(savedPromptsJson);
        for (const promptName in savedPrompts) {
            const option = document.createElement('option');
            option.value = promptName;
            option.textContent = promptName;
            savedPromptsSelect.appendChild(option);
        }
        console.log(`[Prompts] Loaded ${Object.keys(savedPrompts).length} saved prompts`);
    } catch (error) {
        console.error('[Prompts] Error loading saved prompts:', error);
    }
}

function handleSavePromptAs() {
    const promptName = promptTemplateNameInput.value.trim();
    const promptContent = promptBox.value.trim();

    if (!promptName) {
        updateStatus('Please enter a name for the prompt template', CONSTANTS.STATUS_TYPES.WARNING);
        promptTemplateNameInput.focus();
        return;
    }

    if (!promptContent) {
        updateStatus('Prompt template content cannot be empty', CONSTANTS.STATUS_TYPES.WARNING);
        promptBox.focus();
        return;
    }

    try {
        const storageKey = ProjectManager.getScopedKey(CONSTANTS.LOCAL_STORAGE_KEYS.SAVED_PROMPTS);
        let savedPrompts = {};
        const savedPromptsJson = localStorage.getItem(storageKey);
        if (savedPromptsJson) {
            savedPrompts = JSON.parse(savedPromptsJson);
        }

        // Check if name already exists
        if (savedPrompts[promptName]) {
            if (!confirm(`A prompt template with the name "${promptName}" already exists. Do you want to overwrite it?`)) {
                return;
            }
        }

        // Save the new template
        savedPrompts[promptName] = promptContent;
        localStorage.setItem(storageKey, JSON.stringify(savedPrompts));
        updateStatus(`Prompt template "${promptName}" saved successfully`, CONSTANTS.STATUS_TYPES.SUCCESS);
        console.log(`[Prompts] Saved prompt template: ${promptName}`);

        // Update the select dropdown
        loadSavedPromptTemplatesToSelect();
        
        // Select the newly saved prompt
        savedPromptsSelect.value = promptName;
    } catch (error) {
        console.error('[Prompts] Error saving prompt template:', error);
        updateStatus('Error saving prompt template', CONSTANTS.STATUS_TYPES.ERROR);
    }
}

function handleLoadSelectedPrompt() {
    if (!savedPromptsSelect || !promptBox) return;
    const selectedName = savedPromptsSelect.value;
    if (!selectedName) {
        updateStatus('Please select a prompt template to load.', CONSTANTS.STATUS_TYPES.INFO);
        console.log('[PromptTemplate] Load failed: No prompt selected from dropdown.');
        return;
    }

    const savedPrompts = getSavedPrompts();
    if (savedPrompts[selectedName]) {
        promptBox.value = savedPrompts[selectedName];
        // Optionally, also save this loaded prompt as the current active prompt in localStorage
        saveToLocalStorage(CONSTANTS.LOCAL_STORAGE_KEYS.PROMPT_CONTENT, savedPrompts[selectedName]);
        updateStatus(`Prompt template '${selectedName}' loaded.`, CONSTANTS.STATUS_TYPES.SUCCESS);
        console.info(`[PromptTemplate] Prompt template '${selectedName}' loaded successfully.`);
    } else {
        updateStatus(`Error: Prompt template '${selectedName}' not found.`, CONSTANTS.STATUS_TYPES.ERROR);
        console.error(`[PromptTemplate] Error loading prompt: Template '${selectedName}' not found in storage.`);
    }
}

function handleDeleteSelectedPrompt() {
    if (!savedPromptsSelect) return;
    const selectedName = savedPromptsSelect.value;
    if (!selectedName) {
        updateStatus('Please select a prompt template to delete.', CONSTANTS.STATUS_TYPES.INFO);
        console.log('[PromptTemplate] Delete failed: No prompt selected from dropdown.');
        return;
        }

    if (!confirm(`Are you sure you want to delete the prompt template '${selectedName}\'?`)) {
        console.log('[PromptTemplate] Deletion of prompt declined by user.');
        return;
    }
    console.log(`[PromptTemplate] User confirmed deletion for prompt: '${selectedName}'.`);

    const savedPrompts = getSavedPrompts();
    if (savedPrompts[selectedName]) {
        const deletedPromptContent = savedPrompts[selectedName]; // Store before deleting for comparison
        delete savedPrompts[selectedName];
        savePromptsToStorage(savedPrompts);
        loadSavedPromptTemplatesToSelect(); // Refresh dropdown
        if (promptBox.value === deletedPromptContent) { // If the deleted prompt was in the textarea
            console.log('[PromptTemplate] Deleted prompt was active in textarea, resetting to default.');
            promptBox.value = defaultPromptTemplate; // Reset to default or clear
            saveToLocalStorage(CONSTANTS.LOCAL_STORAGE_KEYS.PROMPT_CONTENT, promptBox.value);
        }
        updateStatus(`Prompt template '${selectedName}' deleted.`, CONSTANTS.STATUS_TYPES.SUCCESS);
        console.info(`[PromptTemplate] Prompt template '${selectedName}' deleted successfully.`);
    } else {
        updateStatus(`Error: Prompt template '${selectedName}' not found for deletion.`, CONSTANTS.STATUS_TYPES.ERROR);
        console.error(`[PromptTemplate] Error deleting prompt: Template '${selectedName}' not found in storage.`);
    }
}

// --- End of Prompt Template Management Functions ---

// Event listener for the inter-chunk summary toggle (assuming it exists in HTML)
const interChunkSummaryToggleElement = document.getElementById('inter-chunk-summary-toggle');
if (interChunkSummaryToggleElement) {
    interChunkSummaryToggleElement.addEventListener('change', () => {
        saveToLocalStorage(CONSTANTS.LOCAL_STORAGE_KEYS.INTER_CHUNK_SUMMARY_ENABLED, interChunkSummaryToggleElement.checked);
    });
}

// --- Glossary Management Functions ---
const DEFAULT_GLOSSARY_CATEGORY = 'Ungategorized'; // Default category
const CHARACTER_GLOSSARY_CATEGORIES = ["Characters"]; // Define which categories are considered character names

function getGlossary() {
    try {
        const storageKey = ProjectManager.getScopedKey(CONSTANTS.LOCAL_STORAGE_KEYS.GLOSSARY_TERMS);
        const glossaryJson = localStorage.getItem(storageKey);
        return glossaryJson ? JSON.parse(glossaryJson) : {};
    } catch (e) {
        console.error('[Glossary] Error loading glossary:', e);
        return {};
    }
}

function saveGlossary(glossary) {
    try {
        const storageKey = ProjectManager.getScopedKey(CONSTANTS.LOCAL_STORAGE_KEYS.GLOSSARY_TERMS);
        const glossaryJson = JSON.stringify(glossary);
        localStorage.setItem(storageKey, glossaryJson);
        console.log('[Glossary] Saved glossary to localStorage.');
    } catch (e) {
        console.error('[Glossary] Error saving glossary:', e);
        updateStatus('Error saving glossary. It might be too large for localStorage.', CONSTANTS.STATUS_TYPES.ERROR);
    }
}

function renderGlossary() {
    if (!glossaryDisplayArea || !noGlossaryTermsMsg) return;
    const glossary = getGlossary();
    glossaryDisplayArea.innerHTML = ''; // Clear previous terms

    // If glossary replace is active, trigger a replace when glossary is re-rendered
    // This covers cases where glossary changes (add, delete, edit, AI gen)
    if (glossaryReplaceActive) {
        debouncedHandleReplaceInInput();
    }

    const categories = Object.keys(glossary);

    if (categories.length === 0) {
        noGlossaryTermsMsg.style.display = 'block';
        glossaryDisplayArea.appendChild(noGlossaryTermsMsg);
    } else {
        noGlossaryTermsMsg.style.display = 'none';
        categories.sort().forEach(categoryName => {
            if (glossary.hasOwnProperty(categoryName) && Object.keys(glossary[categoryName]).length > 0) {
                const categoryContainer = document.createElement('div');
                categoryContainer.className = 'glossary-category-container';

                const categoryHeader = document.createElement('h4');
                categoryHeader.className = 'glossary-category-header';
                categoryHeader.textContent = categoryName;
                categoryContainer.appendChild(categoryHeader);

                const ul = document.createElement('ul');
                ul.className = 'glossary-items-list';

                const terms = glossary[categoryName];
                for (const term in terms) {
                    if (terms.hasOwnProperty(term)) {
                        const li = document.createElement('li');
                        li.className = 'glossary-item';
                        
                        const termSpan = document.createElement('span');
                        termSpan.className = 'glossary-term-source-text';
                        termSpan.textContent = term;
                        termSpan.contentEditable = "true";
                        termSpan.dataset.originalTerm = term;
                        termSpan.dataset.category = categoryName; // Add category to dataset

                        const translationSpan = document.createElement('span');
                        translationSpan.className = 'glossary-term-target-text';
                        translationSpan.textContent = terms[term];
                        translationSpan.contentEditable = "true";
                        translationSpan.dataset.category = categoryName; // Add category to dataset
                        translationSpan.dataset.term = term; // Add term for context on blur

                        [termSpan, translationSpan].forEach(span => {
                            span.addEventListener('blur', (event) => {
                                const listItem = event.target.closest('.glossary-item');
                                const currentCategory = event.target.dataset.category;
                                const originalTermKey = listItem.querySelector('.glossary-term-source-text').dataset.originalTerm;
                                const newSourceTerm = listItem.querySelector('.glossary-term-source-text').textContent.trim();
                                const newTargetTranslation = listItem.querySelector('.glossary-term-target-text').textContent.trim();
                                
                                if (!newSourceTerm || !newTargetTranslation) {
                                    updateStatus("Glossary terms cannot be empty. Reverting.", CONSTANTS.STATUS_TYPES.WARNING);
                                    // Revert based on the stored data
                                    const storedGlossary = getGlossary();
                                    listItem.querySelector('.glossary-term-source-text').textContent = originalTermKey;
                                    listItem.querySelector('.glossary-term-target-text').textContent = storedGlossary[currentCategory]?.[originalTermKey] || '';
                                    return;
                                }
                                handleEditGlossaryTerm(currentCategory, originalTermKey, newSourceTerm, newTargetTranslation);
                            });
                        });
                        
                        const deleteBtn = document.createElement('button');
                        deleteBtn.className = 'delete-glossary-term-btn action-btn danger-btn';
                        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
                        deleteBtn.dataset.term = term;
                        deleteBtn.dataset.category = categoryName; // Add category to dataset
                        deleteBtn.title = `Delete term from ${categoryName}`;

                        li.appendChild(termSpan);
                        li.appendChild(document.createTextNode(' → '));
                        li.appendChild(translationSpan);
                        li.appendChild(deleteBtn);
                        ul.appendChild(li);
                    }
                }
                categoryContainer.appendChild(ul);
                glossaryDisplayArea.appendChild(categoryContainer);
            }
        });
    }
}

function handleAddGlossaryTerm() {
    const categoryInput = document.getElementById('glossary-category');
    if (!glossaryTermSourceInput || !glossaryTermTargetInput || !categoryInput) return;

    let categoryName = categoryInput.value.trim();
    const sourceTerm = glossaryTermSourceInput.value.trim();
    const targetTranslation = glossaryTermTargetInput.value.trim();

    if (!categoryName) {
        categoryName = DEFAULT_GLOSSARY_CATEGORY;
    }

    if (!sourceTerm) {
        updateStatus('Source term cannot be empty.', CONSTANTS.STATUS_TYPES.WARNING);
        glossaryTermSourceInput.focus();
        return;
    }
    if (!targetTranslation) {
        updateStatus('Target translation cannot be empty.', CONSTANTS.STATUS_TYPES.WARNING);
        glossaryTermTargetInput.focus();
        return;
    }

    const glossary = getGlossary();

    // Ensure the category exists as an object
    if (!glossary[categoryName]) {
        glossary[categoryName] = {};
    }

    if (glossary[categoryName][sourceTerm] && glossary[categoryName][sourceTerm] !== targetTranslation) {
        if (!confirm(`The term "${sourceTerm}" in category "${categoryName}" already exists with translation "${glossary[categoryName][sourceTerm]}". Overwrite with "${targetTranslation}"?`)) {
            return;
        }
    }

    glossary[categoryName][sourceTerm] = targetTranslation;
    saveGlossary(glossary);
    renderGlossary();
    updateStatus(`Glossary term "${sourceTerm}" added/updated in category "${categoryName}".`, CONSTANTS.STATUS_TYPES.SUCCESS);
    
    // Clear inputs, but not category so user can add multiple terms to same category easily
    glossaryTermSourceInput.value = '';
    glossaryTermTargetInput.value = '';
    // categoryInput.value = ''; // Optionally clear category too
    glossaryTermSourceInput.focus();
}

function handleDeleteGlossaryTerm(categoryName, termToDelete) { // Modified signature
    if (!confirm(`Are you sure you want to delete the glossary term "${termToDelete}\" from category "${categoryName}"?`)) {
        return;
    }
    const glossary = getGlossary();
    if (glossary[categoryName] && glossary[categoryName].hasOwnProperty(termToDelete)) {
        delete glossary[categoryName][termToDelete];
        // If category becomes empty, remove the category itself
        if (Object.keys(glossary[categoryName]).length === 0) {
            delete glossary[categoryName];
        }
        saveGlossary(glossary);
        renderGlossary();
        updateStatus(`Glossary term "${termToDelete}\" from "${categoryName}" deleted.`, CONSTANTS.STATUS_TYPES.SUCCESS);
    } else {
        updateStatus(`Error: Term "${termToDelete}\" not found in category "${categoryName}".`, CONSTANTS.STATUS_TYPES.ERROR);
    }
}

// New function to handle editing a glossary term
function handleEditGlossaryTerm(categoryName, originalSourceTerm, newSourceTerm, newTargetTranslation) { // Modified signature
    const glossary = getGlossary();

    if (!newSourceTerm.trim() || !newTargetTranslation.trim()) {
        updateStatus("Glossary source and target terms cannot be empty.", CONSTANTS.STATUS_TYPES.WARNING);
        renderGlossary(); // Re-render to revert
        return;
    }

    if (!glossary[categoryName]) {
        console.error(`[GlossaryEdit] Category "${categoryName}" not found for term "${originalSourceTerm}".`);
        renderGlossary(); // Re-render if data is inconsistent
        return;
    }

    // Check if the original term exists before trying to modify it
    if (!glossary[categoryName].hasOwnProperty(originalSourceTerm)) {
        console.warn(`[GlossaryEdit] Original term "${originalSourceTerm}\" not found in category "${categoryName}\" for editing.`);
        // It might have been changed by another edit, so just try to add the new one if it makes sense
        // or simply re-render to get the latest state.
        renderGlossary();
        return;
    }

    // If the source term has changed, we need to delete the old entry and add a new one
    // Also, check if the new term name already exists in this category
    if (originalSourceTerm !== newSourceTerm) {
        if (glossary[categoryName].hasOwnProperty(newSourceTerm)) {
            if (!confirm(`The term "${newSourceTerm}\" already exists in category "${categoryName}\". Overwrite its translation?`)) {
                renderGlossary(); // Re-render to revert changes
                return;
            }
        }
        delete glossary[categoryName][originalSourceTerm];
        console.log(`[GlossaryEdit] Term "${originalSourceTerm}\" in "${categoryName}\" deleted due to rename to "${newSourceTerm}".`);
    }
    
    glossary[categoryName][newSourceTerm] = newTargetTranslation;
    saveGlossary(glossary);

    // After editing, ensure the dataset attributes are updated for subsequent edits/deletes.
    // The blur event listener in renderGlossary updates the span's dataset.originalTerm if term changed.
    // However, a full re-render is safer to ensure all delete buttons etc are correct.
    renderGlossary(); 

    updateStatus(`Glossary term in "${categoryName}\" updated to "${newSourceTerm}\".`, CONSTANTS.STATUS_TYPES.SUCCESS);
    console.log(`[GlossaryEdit] Term in "${categoryName}\": "${originalSourceTerm}\" updated to "${newSourceTerm} : ${newTargetTranslation}".`);
}

// Setup function for glossary button event listener
const setupGlossaryButtonEvents = () => {
    if (glossaryDisplayArea) {
        glossaryDisplayArea.addEventListener('click', (event) => {
            const targetButton = event.target.closest('.delete-glossary-term-btn');
            if (targetButton) {
                const termToDelete = targetButton.dataset.term;
                const categoryName = targetButton.dataset.category; // Get category from button
                if (termToDelete && categoryName) {
                    handleDeleteGlossaryTerm(categoryName, termToDelete);
                } else {
                    console.warn('[GlossaryDeleteBtn] Missing term or category data on delete button.', targetButton.dataset);
                }
            }
        });
    }
};

// --- AI Glossary Generation Function ---
async function handleAIGlossaryGeneration() {
    console.info('[AIGlossary] Initiating AI glossary generation...');
    // const AI_GENERATED_CATEGORY = "AI Suggested"; // Old default category

    if (!translationBox || !modelSelect) {
        updateStatus("Cannot generate glossary: Missing required elements (source text or model select).", CONSTANTS.STATUS_TYPES.ERROR);
        return;
    }

    const originalSourceText = translationBox.value.trim();
    const fandomContext = fandomBox.value.trim() || CONSTANTS.DEFAULT_VALUES.FANDOM_CONTEXT;
    const notes = notesBox.value.trim() || CONSTANTS.DEFAULT_VALUES.NOTES;
    const selectedModel = modelSelect.value;
    const sourceLanguage = sourceLanguageInput.value.trim() || CONSTANTS.DEFAULT_VALUES.SOURCE_LANGUAGE;
    const targetLanguage = targetLanguageInput ? (targetLanguageInput.value.trim() || 'English') : 'English'; // Changed from .textContent to .value
    const temperature = 0.3;

    if (!originalSourceText) {
        updateStatus('Please enter source text to generate glossary from.', CONSTANTS.STATUS_TYPES.WARNING);
        return;
    }

    updateStatus('Preparing to generate glossary with AI...', CONSTANTS.STATUS_TYPES.PROCESSING);
    const aiGenerateGlossaryBtn = document.getElementById('ai-generate-glossary-btn');
    if (aiGenerateGlossaryBtn) aiGenerateGlossaryBtn.disabled = true;

    let overallSuccess = true;
    let abortControllerForGlossary = new AbortController();

    try { // Outer try
        const textChunks = await createTextChunks(originalSourceText, selectedModel);
        if (textChunks.length === 0) {
            updateStatus('No text to process for glossary generation.', CONSTANTS.STATUS_TYPES.INFO);
            if (aiGenerateGlossaryBtn) aiGenerateGlossaryBtn.disabled = false;
            return; 
        }
        
        updateStatus(`Starting glossary generation for ${textChunks.length} chunks...`, CONSTANTS.STATUS_TYPES.PROCESSING);
        
        // This will store terms categorized by the AI: { "Category1": { "termA": "transA" }, "Category2": { ... } }
        const allIdentifiedTermsByCategory = {}; 
        let totalChunksProcessed = 0;

        const validAICategories = ["Characters", "Locations", "Techniques", "Items", "Concepts", "Titles", "Organizations", "Other"];
        const defaultAICategoryOnError = "AI Suggested - Needs Review";

        for (let i = 0; i < textChunks.length; i++) {
            if (abortControllerForGlossary.signal.aborted) {
                console.info('[AIGlossary] Glossary generation aborted by user during chunk processing.');
                overallSuccess = false;
                break;
            }
            const chunkTextToAnalyze = textChunks[i];
            const chunkNumber = i + 1;
            updateStatus(`Generating glossary for chunk ${chunkNumber} of ${textChunks.length}...`, CONSTANTS.STATUS_TYPES.PROCESSING, 0);
            
            // Format existing glossary for the prompt
            const currentGlossaryForPrompt = getGlossary();
            let formattedExistingGlossary = "None";
            const existingTermsArray = [];
            for (const catName in currentGlossaryForPrompt) {
                if (currentGlossaryForPrompt.hasOwnProperty(catName)) {
                    const termsInCat = currentGlossaryForPrompt[catName];
                    for (const srcTerm in termsInCat) {
                        if (termsInCat.hasOwnProperty(srcTerm)) {
                            existingTermsArray.push(`${catName}: ${srcTerm}: ${termsInCat[srcTerm]}`);
                        }
                    }
                }
            }
            if (existingTermsArray.length > 0) {
                formattedExistingGlossary = existingTermsArray.join('\n');
            }

            const prompt = CONSTANTS.PROMPTS.AI_GLOSSARY_GENERATION
                .replace(/{source_language}/g, sourceLanguage)
                .replace(/{target_language}/g, targetLanguage)
                .replace(/{fandom_context}/g, fandomContext)
                .replace(/{notes}/g, notes)
                .replace(/{existing_glossary_terms}/g, formattedExistingGlossary) // Add existing glossary to prompt
                .replace(/{source_text}/g, chunkTextToAnalyze);

            try { // Inner try for each chunk API call
                const aiResponse = await getTranslation(prompt, selectedModel, temperature, false, null, abortControllerForGlossary.signal);
                
                if (abortControllerForGlossary.signal.aborted) { 
                    overallSuccess = false; 
                    break; 
                }

                if (aiResponse && aiResponse.trim().toLowerCase() !== "no specific glossary terms identified." && aiResponse.trim().toLowerCase() !== "no new glossary terms identified or improvements needed.") {
                    const lines = aiResponse.trim().split('\n');
                    for (const line of lines) {
                        const parts = line.split(':');
                        if (parts.length >= 3) { // Expecting "Category: Original Term: Translated Term"
                            let category = parts[0].trim();
                            const sourceTerm = parts[1].trim();
                            const targetTranslation = parts.slice(2).join(':').trim(); // Join back in case translation has colons

                            if (!validAICategories.includes(category)) {
                                console.warn(`[AIGlossary] AI provided invalid category: '${category}'. Using default: '${defaultAICategoryOnError}'. Term: '${sourceTerm}'`);
                                category = defaultAICategoryOnError;
                            }

                            if (sourceTerm && targetTranslation) {
                                if (!allIdentifiedTermsByCategory[category]) {
                                    allIdentifiedTermsByCategory[category] = {};
                                }
                                allIdentifiedTermsByCategory[category][sourceTerm] = targetTranslation; // Overwrite if duplicate from AI within same category
                            }
                        } else {
                            console.warn(`[AIGlossary] AI response line did not match expected format (Category: Term: Translation): '${line}'`);
                        }
                    }
                }
                totalChunksProcessed++;
            } catch (chunkError) { // Inner catch
                if (chunkError.name === 'AbortError') {
                    console.info(`[AIGlossary Chunk ${chunkNumber}] Aborted by user.`);
                } else {
                    console.error(`[AIGlossary Chunk ${chunkNumber}] Error:`, chunkError);
                    updateStatus(`Error on glossary chunk ${chunkNumber}: ${chunkError.message}`, CONSTANTS.STATUS_TYPES.ERROR, 10000);
                }
                if (abortControllerForGlossary.signal.aborted) {
                    break; 
                }
            } // End inner catch
        } // End for loop
        
        if (Object.keys(allIdentifiedTermsByCategory).length > 0) {
            const currentGlossary = getGlossary();
            let newTermsAddedCount = 0;
            let categoriesAffected = new Set();

            for (const category in allIdentifiedTermsByCategory) {
                if (allIdentifiedTermsByCategory.hasOwnProperty(category)) {
                    if (!currentGlossary[category]) {
                        currentGlossary[category] = {}; // Ensure category exists in main glossary
                    }
                    const termsInAICategory = allIdentifiedTermsByCategory[category];
                    for (const sourceTerm in termsInAICategory) {
                        if (termsInAICategory.hasOwnProperty(sourceTerm)) {
                            const targetTranslation = termsInAICategory[sourceTerm];
                            // Add or update term in its AI-determined category
                            // This will overwrite if the term already exists in that category from a previous AI run or manual entry
                            currentGlossary[category][sourceTerm] = targetTranslation;
                            newTermsAddedCount++;
                            categoriesAffected.add(category);
                        }
                    }
                }
            }

            if (newTermsAddedCount > 0) {
                saveGlossary(currentGlossary);
                renderGlossary();
                const affectedCategoryList = Array.from(categoriesAffected).join(', ');
                updateStatus(`AI processed ${totalChunksProcessed}/${textChunks.length} chunks and added/updated ${newTermsAddedCount} term(s) in categories: ${affectedCategoryList}.`, CONSTANTS.STATUS_TYPES.SUCCESS);
            } else {
                 updateStatus(`AI processed ${totalChunksProcessed}/${textChunks.length} chunks. No new or different terms were identified or updated by AI.`, CONSTANTS.STATUS_TYPES.INFO);
            }
        } else if (overallSuccess && totalChunksProcessed === textChunks.length) {
             updateStatus(`AI processed all ${textChunks.length} chunks. No new glossary terms were identified by the AI, or no improvements were needed for existing ones.`, CONSTANTS.STATUS_TYPES.INFO);
        } else if (!overallSuccess) { // This includes aborted cases
            updateStatus(`Glossary generation stopped or completed with errors after processing ${totalChunksProcessed}/${textChunks.length} chunks.`, CONSTANTS.STATUS_TYPES.WARNING);
        }

    } catch (error) { // Outer catch for setup errors etc.
        console.error('[AIGlossary] General error during AI glossary generation setup:', error);
        updateStatus('Error setting up AI glossary generation: ' + error.message, CONSTANTS.STATUS_TYPES.ERROR);
    } finally { // Outer finally
        if (aiGenerateGlossaryBtn) aiGenerateGlossaryBtn.disabled = false;
        // Stop button hook (remains unchanged for now)
        if (stopBtn && !translationInProgress) {
            const originalStopAction = stopBtn.onclick;
            stopBtn.onclick = () => {
                if (abortControllerForGlossary && !abortControllerForGlossary.signal.aborted) {
                    abortControllerForGlossary.abort();
                }
                if (typeof originalStopAction === 'function') originalStopAction();
                stopBtn.onclick = originalStopAction;
            };
        } else if (stopBtn && translationInProgress && abortControllerForGlossary && !abortControllerForGlossary.signal.aborted) {
            // No change here
        }
    }
}
// --- End of AI Glossary Generation Function ---

// --- Token Count and Cost Estimation Functions ---
async function updateTokenCountAndCost() {
    if (!translationBox || !modelSelect || !inputTokenCountEl || !inputCostEstimateEl) {
        if (inputTokenCountEl) inputTokenCountEl.textContent = 'Estimated Tokens: N/A';
        if (inputCostEstimateEl) inputCostEstimateEl.textContent = 'Estimated Cost: N/A';
        return;
    }

    const text = translationBox.value.trim();
    const selectedModel = modelSelect.value;
    let tokenCount = 0;
    let countSource = 'client-side estimate';

    if (!text) {
        inputTokenCountEl.textContent = 'Estimated Tokens: 0';
        inputCostEstimateEl.textContent = 'Estimated Cost: $0.00';
        return;
    }

    // TODO: Implement tokenizer server call here when server endpoint is ready
    if (tokenizerServerUrl) {
        try {
            console.log(`[Tokenizer] Fetching token count from server for ${text.length} chars.`);
            const response = await fetch(`${tokenizerServerUrl}/tokenize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text })
            });
            if (response.ok) {
                const data = await response.json();
                if (data && typeof data.token_count === 'number') {
                    tokenCount = data.token_count;
                    countSource = 'server';
                } else {
                    console.warn('[Tokenizer] Server response missing token_count.');
                    // Fallback to client-side if server response is malformed
                    countSource = 'client-side estimate (server error)'; 
                }
            } else {
                console.warn(`[Tokenizer] Server error: ${response.status}`);
                 // Fallback to client-side if server returns an error
                countSource = 'client-side estimate (server unavailable)';
            }
        } catch (error) {
            console.error('[Tokenizer] Error calling tokenizer server:', error);
            // Fallback to client-side if fetch fails
            countSource = 'client-side estimate (fetch error)';
        }
    }

    if (countSource.startsWith('client-side estimate')) { // If server call failed/skipped, or resulted in fallback
        const words = text.split(/\s+/).filter(Boolean).length;
        if (selectedModel.startsWith(CONSTANTS.MODELS.GROK_PREFIX) || selectedModel === CONSTANTS.MODELS.DEEPSEEK_CHAT || selectedModel.startsWith(CONSTANTS.MODELS.OPENROUTER_PREFIX)) {
            tokenCount = Math.ceil(words * 1.35); // General heuristic for English-like text
            if (text.match(/[\u4E00-\u9FFF]/)) { // If CJK characters are present
                tokenCount = Math.ceil(text.length * 0.8); // CJK often closer to 1 char = 1 token, but can be more complex
            }
        } else {
            tokenCount = Math.ceil(text.length / 3); // Generic fallback for unknown models
        }
        // countSource is already 'client-side estimate' by default or set in catch blocks
    }

    inputTokenCountEl.textContent = `Estimated Tokens: ${tokenCount.toLocaleString()} (${countSource})`;

    // Cost Estimation
    if (modelPricing[selectedModel] && modelPricing[selectedModel].input) {
        const inputPriceString = modelPricing[selectedModel].input.replace('$', '');
        const inputPricePerMillion = parseFloat(inputPriceString);
        if (!isNaN(inputPricePerMillion)) {
            const cost = (tokenCount / 1000000) * inputPricePerMillion;
            let formattedCost;
            if (cost === 0) {
                formattedCost = '$0.00';
            } else if (cost < 0.0001 && cost > 0) { // e.g. $0.00005
                formattedCost = '~$0.0001 <'; // Indicate it's very small but positive
            } else if (cost < 0.01) { // e.g. $0.005 -> $0.0050
                formattedCost = `~$${cost.toFixed(4)}`;
            } else { // e.g. $0.015 -> $0.02
                formattedCost = `~$${cost.toFixed(2)}`;
            }
            inputCostEstimateEl.textContent = `Estimated Cost: ${formattedCost}`;
        } else {
            inputCostEstimateEl.textContent = 'Estimated Cost: N/A (parse error)';
        }
    } else {
        inputCostEstimateEl.textContent = 'Estimated Cost: N/A (pricing unavailable)';
    }
}
// --- End of Token Count and Cost Estimation Functions ---

// Debounced version of handleReplaceInInput
const debouncedHandleReplaceInInput = debounce(handleReplaceInInput, 1000); 

// Function to replace glossary terms in input text
function handleReplaceInInput(forceReplace = false) {
    if (!glossaryReplaceActive && !forceReplace) {
        console.log('[GlossaryReplace] Toggle is OFF and not forced, skipping replacement.');
        return;
    }
    if (!translationBox) return;

    console.log('[GlossaryReplace] Starting glossary replacement in source text...');
    let text = translationBox.value;
    const glossary = getGlossary();
    let termsReplacedCount = 0;

    // Create a sorted list of terms by length (descending) to replace longer matches first
    const allTermsToReplace = [];
    for (const categoryName in glossary) {
        if (glossary.hasOwnProperty(categoryName) && !CHARACTER_GLOSSARY_CATEGORIES.includes(categoryName)) {
            const termsInCategory = glossary[categoryName];
            for (const sourceTerm in termsInCategory) {
                if (termsInCategory.hasOwnProperty(sourceTerm)) {
                    allTermsToReplace.push({ source: sourceTerm, target: termsInCategory[sourceTerm] });
                }
            }
        }
    }
    // Sort by source term length, longest first to avoid partial replacements (e.g., replacing "King" before "Kingdom")
    allTermsToReplace.sort((a, b) => b.source.length - a.source.length);

    for (const termObj of allTermsToReplace) {
        const sourceTermRegex = new RegExp(termObj.source.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&'), 'g'); // Escape regex special chars
        if (text.includes(termObj.source)) { // Basic check to see if replacement is needed
            text = text.replace(sourceTermRegex, termObj.target);
            termsReplacedCount++;
            // console.log(`[GlossaryReplace] Replaced "${termObj.source}" with "${termObj.target}"`);
        }
    }

    if (termsReplacedCount > 0) {
        translationBox.value = text;
        // Trigger input event for word count and auto-save
        translationBox.dispatchEvent(new Event('input', { bubbles: true })); 
        updateStatus(`${termsReplacedCount} non-character glossary term(s) replaced in source text.`, CONSTANTS.STATUS_TYPES.SUCCESS, 3000);
        console.log(`[GlossaryReplace] Finished. Replaced ${termsReplacedCount} term(s).`);
    } else {
        // updateStatus('No non-character glossary terms found to replace in source text.', CONSTANTS.STATUS_TYPES.INFO, 2000);
        console.log('[GlossaryReplace] Finished. No terms needed replacement or found.');
    }
}

// Main initialization when DOM is loaded
// REMOVED: Duplicate initialization that was causing double loading
// document.addEventListener('DOMContentLoaded', () => {
//     console.log('Document loaded. Initializing application...');
//     
//     // Initialize ProjectManager first
//     ProjectManager.init();
//     
//     loadFromLocalStorage();
//     
//     // ... rest of the function remains unchanged
// });

// Function to load OpenRouter models dynamically
async function loadOpenRouterModels() {
    const openRouterOptGroup = document.querySelector('#model-select optgroup[label="OpenRouter"]');
    if (!openRouterOptGroup) {
        console.error('[OpenRouterModels] OpenRouter optgroup not found in model select.');
        return;
    }

    openRouterOptGroup.innerHTML = ''; // Clear any existing dummy/error options

    try {
        console.log('[OpenRouterModels] Fetching models from OpenRouter API...');
        updateStatus('Fetching OpenRouter models...', CONSTANTS.STATUS_TYPES.PROCESSING, 0);
        const response = await fetch('https://openrouter.ai/api/v1/models');
        
        if (!response.ok) {
            let errorText = `API Error: ${response.status}`;
            try {
                const errorDetails = await response.json(); // Try to get more details
                errorText += ` - ${errorDetails.error?.message || response.statusText}`;
            } catch (e) {
                errorText += ` - ${response.statusText}`;
            }
            console.error(`[OpenRouterModels] ${errorText}`);
            updateStatus(`Failed to load OpenRouter models: ${response.status}`, CONSTANTS.STATUS_TYPES.ERROR);
            const errorOption = document.createElement('option');
            errorOption.textContent = 'Failed to load models';
            errorOption.disabled = true;
            openRouterOptGroup.appendChild(errorOption);
            return;
        }

        const { data } = await response.json();
        if (!data || data.length === 0) {
            console.warn('[OpenRouterModels] No models returned from OpenRouter API.');
            updateStatus('No models found from OpenRouter.', CONSTANTS.STATUS_TYPES.INFO);
            const noModelsOption = document.createElement('option');
            noModelsOption.textContent = 'No models available';
            noModelsOption.disabled = true;
            openRouterOptGroup.appendChild(noModelsOption);
            return;
        }

        console.log(`[OpenRouterModels] Received ${data.length} models from API.`);
        openRouterModelData = {}; // Reset and populate with new data

        // Sort models by name for better UX, handling cases where name might be missing
        data.sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id));

        data.forEach(model => {
            // Use the model.id which is the full path OpenRouter expects
            const optionValue = model.id; // e.g., "openai/gpt-3.5-turbo" or "anthropic/claude-3-haiku-20240307"
            
            const option = document.createElement('option');
            option.value = optionValue;
            option.textContent = model.name || model.id; // Display user-friendly name or ID if name is missing
            openRouterOptGroup.appendChild(option);

            // Store model details for pricing and context length
            // OpenRouter provides pricing per million tokens
            openRouterModelData[optionValue] = {
                name: model.name || model.id,
                pricing: {
                    input: model.pricing?.input || '0', 
                    output: model.pricing?.output || '0'
                },
                context_length: model.context_length || 0 
            };
        });

        console.log('[OpenRouterModels] Successfully populated OpenRouter models in dropdown.');
        updateStatus('OpenRouter models loaded.', CONSTANTS.STATUS_TYPES.SUCCESS, 3000);
        // Don't call updatePricingDisplay() here directly, it will be called if the selection changes
        // or if an OpenRouter model was already selected during loadFromLocalStorage.

    } catch (error) {
        console.error('[OpenRouterModels] Error fetching or processing OpenRouter models:', error);
        updateStatus('Error loading OpenRouter models. Check console.', CONSTANTS.STATUS_TYPES.ERROR);
        const errorOption = document.createElement('option');
        errorOption.textContent = 'Error loading models';
        errorOption.disabled = true;
        openRouterOptGroup.appendChild(errorOption);
    }
}
