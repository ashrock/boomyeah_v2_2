document.addEventListener("DOMContentLoaded", async () => {
    const current_location = window.location.pathname;
    const view_path = current_location.substring(0, current_location.lastIndexOf('/'));

    let global_path = (view_path === "/views")? "." : "..";
    let assets_path = (view_path === "/views" )? ".." : "../..";

    /* Render global view elements */
    await include("#main_navigation" , `${global_path}/global/main_navigation.html`, `${assets_path}/assets/js/main_navigation.js`);
    await include("#invite_modal", `${global_path}/global/invite_modal.html`, `${assets_path}/assets/js/invite_modal.js`);

    let confirm_public = document.querySelectorAll('.modal');
    let instances = M.Modal.init(confirm_public);

    let confirm = document.querySelectorAll('.modal');
    let instance = M.Modal.init(confirm);

    const invite_form = document.querySelector("#invite_form");
    invite_form.addEventListener("submit", submitInvite);

    /* Print all documentation */
    // displayDocumentations(data.documentations);

    initializeMaterializeDropdown();
    ux("#doc_form").on("submit", submitDocForm);
    appearEmptyDocumentation();

    ux(".document_block").onEach("dblclick", function(){
        location.href = "admin_edit_documentation.html";
    });
    
    ux(".edit_title_icon").onEach("click", editTitleDocumentation);

    ux(".remove_icon").onEach("click", removeDocumentation);
    ux(".archive_icon").onEach("click", removeDocumentation);
    ux(".duplicate_icon").onEach("click", duplicateDocumentation);
    ux(".document_title").onEach("blur", disableEditTitleDocumentation);

    ux(".active_docs_btn").onEach("click", appearActiveDocumentation);
    ux(".archived_docs_btn").onEach("click", appearArchivedDocumentations);

    document.querySelectorAll("#documentations").forEach((section_tabs_list) => {
        Sortable.create(section_tabs_list);
    });

    const email_address = document.querySelector("#email_address");    
    email_address.addEventListener("keyup", searchEmail);

    document.addEventListener("click", (event) => {
        event.stopPropagation();
        event.preventDefault();

        let element = event.target.closest(".add_invite_result");
        
        if(element){
            addSearchEmailResult(element);
        }
    });
});

function submitInvite(event){
    event.preventDefault();
}

function submitDocForm(event){
    event.preventDefault();
    
    const input_add_documentation = ux("#input_add_documentation").html();
    const document_block = ux(".document_block.hidden").clone();
    const documentations = ux("#documentations").html();
    const document_title =  ux(document_block.find(".document_details input")).html();
    const input_field = ux(input_add_documentation.closest(".input-field"));

    if(!input_add_documentation.value.trim().length){
        input_field.addClass("input_error");
    }else{
        input_field.removeClass("input_error");
        document_block.html().setAttribute("class", "document_block");
        document_title.html().value = input_add_documentation.value;
        
        document_block.on("dblclick", function(){
            location.href = "/views/admin_edit_documentation.html";
        })

        documentations.appendChild(document_block.html());
        initializeMaterializeDropdown();
    }

    event.target.reset();
    ux(ux(".group_add_documentation label").html()).addClass("active");
}

function displayDocumentations(documentations){
    const documentation_div = document.getElementById("documentations");
    let document_block = "";

    /* Print all documentation */
    documentations.forEach((document, index) => {
        document_block += `
            <div class="document_block">
                <div class="document_details">
                    <input type="text" name="document_title" value="${document.title}" id="" class="document_title" readonly="">
                    ${ document.is_private ? `<button class="invite_collaborators_btn modal-trigger" href="#modal1"> ${document.collaborator_count}</button>` : ''}
                </div>
                <div class="document_controls">
                    ${ document.is_private ? '<button class="access_btn modal-trigger" href="#confirm_to_public"></button>' : '' }
                    <button class="more_action_btn dropdown-trigger" data-target="document_${ document.is_private ? `pr0${index}` : `pu0${index}` }">⁝</button>
                    <!-- Dropdown Structure -->
                    <ul id="document_${ document.is_private ? `pr0${index}` : `pu0${index}` }" class="dropdown-content more_action_list_${ document.is_private ? 'private' : 'public' }">
                        <li class="edit_title_btn"><a href="#!" class="edit_title_icon">Edit Title</a></li>
                        <li class="divider" tabindex="-1"></li>
                        <li><a href="#!" class="duplicate_icon">Duplicate</a></li>
                        <li class="divider" tabindex="-1"></li>
                        <li><a href="#!" class="archive_icon">Archive</a></li>
                        <li class="divider" tabindex="-1"></li>
                        <li><a href="#modal1" class="invite_icon modal-trigger">Invite</a></li>
                        ${ document.is_private ? `<li class="divider" tabindex="-1"></li>
                        <li><a href="#confirm_to_public" class="set_to_public_icon modal-trigger">Set to Public</a></li>` : 
                        `<li class="divider" tabindex="-1"></li>
                        <li><a href="#confirm_to_private" class="set_to_private_icon modal-trigger">Set to Private</a></li>` }
                        <li class="divider" tabindex="-1"></li>
                        <li><a href="#!" class="remove_icon">Remove</a></li>
                    </ul>
                </div>
            </div>`;
    });

    console.log(document_block);
}

function initializeMaterializeDropdown(){
    let elems = document.querySelectorAll('.dropdown-trigger');
    M.Dropdown.init(elems, {
        alignment: 'left',
        coverTrigger: false,
        constrainWidth: false
    });
}

function appearEmptyDocumentation(){
    let documentations_count = ux("#documentations").html().children.length;
    if(documentations_count <= 2){
        ux(".no_documents").removeClass("hidden");
    }else{
        ux(".no_documents").addClass("hidden");
    }
    
    let archived_documents_count = ux("#archived_documents").html().children.length;
    if(archived_documents_count <= 1){
        ux(".no_archived_documents").removeClass("hidden");
    }else{
        ux(".no_archived_documents").addClass("hidden");
    }
}

function editTitleDocumentation(event){
    let edit_title_btn = event.target;
    let document_block = ux(edit_title_btn.closest(".document_block"));
    let document_title = ux(document_block.find(".document_details .document_title")).html();
    let end = document_title.html().value.length;

    document_title.html().removeAttribute("readonly");
    document_title.html().setSelectionRange(end, end);
    setTimeout(() => document_title.html().focus(), 0);
}

function disableEditTitleDocumentation(event){
    let document_title = event.target;
    
    document_title.setAttribute("readonly", "");
}

function removeDocumentation(event){
    event.target.closest(".document_block").remove();
    appearEmptyDocumentation();
}

function duplicateDocumentation(event){
    let source = event.target.closest(".document_block");
    let document_title = ux(source).find(".document_title").html();
    let cloned = ux(source).clone();
    let cloned_title = ux(cloned.find(".document_title")).html();
    let cloned_target = ux(cloned.find(".more_action_btn")).html();
    let cloned_list = ux(cloned.find(".dropdown-content")).html();
    let copy_title = "copy_of_" + document_title.value.toLowerCase();


    cloned_title.html().setAttribute("style", "");
    cloned_title.html().setAttribute("value", "Copy of " + cloned_title.html().value);
    cloned_target.html().setAttribute("data-target", copy_title);
    cloned_list.html().setAttribute("id", copy_title);
    cloned_list.html().setAttribute("style", "");

    ux(cloned.find(".edit_title_icon").on("click", editTitleDocumentation));
    ux(cloned.find(".remove_icon").on("click", removeDocumentation));
    ux(cloned.find(".duplicate_icon").on("click", duplicateInnerElement));
    ux(cloned.find(".document_title").on("click", disableEditTitleDocumentation));
    
    source.insertAdjacentElement("afterend", cloned.html());
    initializeMaterializeDropdown();
}

function duplicateInnerElement(event){
    let origin = event.target.closest(".document_block");
    let document_title = ux(origin).find(".document_title").html();
    let replica = ux(origin).clone();
    let replica_title = ux(replica.find(".document_title")).html();
    let replica_target = ux(replica.find(".more_action_btn")).html();
    let replica_list = ux(replica.find(".dropdown-content")).html();
    let copy_title = "copy_of_" + document_title.value.toLowerCase();
    
    replica_title.html().setAttribute("style", "");
    replica_title.html().setAttribute("value", "Copy of " + replica_title.html().value);
    replica_target.html().setAttribute("data-target", copy_title);
    replica_target.html().setAttribute("data-target", "document_copy");
    replica_list.html().setAttribute("id", "document_copy");
    replica_list.html().setAttribute("style", "");

    ux(replica.find(".edit_title_icon").on("click", editTitleDocumentation));
    ux(replica.find(".remove_icon").on("click", removeDocumentation));
    ux(replica.find(".duplicate_icon").on("click", duplicateDocumentation));
    ux(replica.find(".document_title").on("click", disableEditTitleDocumentation));

    origin.insertAdjacentElement("afterend", replica.html());
    initializeMaterializeDropdown();
}

function appearActiveDocumentation(event){
    let active_docs_btn = event.target;
    let container = ux(active_docs_btn.closest(".container"));
    let docs_view_btn = ux(container.find("#docs_view_btn")).html();

    docs_view_btn.html().innerText = active_docs_btn.innerText;
    ux("#documentations").removeClass("hidden");
    ux("#archived_documents").addClass("hidden");
    window.location.reload();
}

function appearArchivedDocumentations(event){
    let archived_docs_btn = event.target;
    let container = ux(archived_docs_btn.closest(".container"));
    let docs_view_btn = ux(container.find("#docs_view_btn")).html();

    docs_view_btn.html().innerText = archived_docs_btn.innerText;
    ux("#archived_documents").removeClass("hidden");
    ux("#documentations").addClass("hidden");
}