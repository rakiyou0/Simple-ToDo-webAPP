let taskCounter = 0;

// 統計を更新する関数
function updateStats() {
    const totalTasks = $("#todoList li").length;
    const completedTasks = $("#todoList li .todo-checkbox:checked").length;
    const pendingTasks = totalTasks - completedTasks;
    
    $("#totalTasks").text(totalTasks);
    $("#completedTasks").text(completedTasks);
    $("#pendingTasks").text(pendingTasks);
    
    // 空の状態を表示/非表示
    if (totalTasks === 0) {
        $("#emptyState").show();
    } else {
        $("#emptyState").hide();
    }
}

// タスク追加
$("#addToDo").click(function () {
    addTask();
});

// Enterキーでタスク追加
$("#input").keypress(function(e) {
    if (e.which === 13) {
        addTask();
    }
});

function addTask() {
    const inputTodo = $("#input").val().trim();
    if (inputTodo !== "") {
        taskCounter++;
        const taskId = `task-${taskCounter}`;
        const taskHtml = `
            <li class="todo-item" data-task-id="${taskId}">
                <div class="priority-indicator"></div>
                <input type="checkbox" class="todo-checkbox" id="${taskId}">
                <span class="todo-text">${inputTodo}</span>
                <div class="todo-actions">
                    <button class="action-btn edit-btn" title="編集">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" title="削除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </li>
        `;
        
        $("#todoList").append(taskHtml);
        $("#input").val("");
        updateStats();
        
        // 追加アニメーション
        const newTask = $(`[data-task-id="${taskId}"]`);
        newTask.hide().fadeIn(500);
    }
}

// チェックボックスの状態変更時の処理
$(document).on('change', '.todo-checkbox', function() {
    const todoItem = $(this).closest('.todo-item');
    const todoText = $(this).siblings('.todo-text');
    
    if ($(this).is(':checked')) {
        todoText.addClass('completed');
        todoItem.addClass('completed');
        
        // 完了アニメーション
        todoItem.animate({
            opacity: 0.7
        }, 300).animate({
            opacity: 1
        }, 300);
        
        // 紙吹雪エフェクト（簡易版）
        showCompletionEffect(todoItem);
    } else {
        todoText.removeClass('completed');
        todoItem.removeClass('completed');
    }
    
    updateStats();
});

// 完了エフェクト
function showCompletionEffect(element) {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    element.css('border-left-color', randomColor);
    setTimeout(() => {
        element.css('border-left-color', '#28a745');
    }, 1000);
}

// 削除ボタンクリック時の処理
$(document).on('click', '.delete-btn', function() {
    const todoItem = $(this).closest('.todo-item');
    
    // 削除確認
    if (confirm('このタスクを削除しますか？')) {
        // 削除アニメーション
        todoItem.animate({
            opacity: 0,
            height: 0,
            padding: 0,
            margin: 0
        }, 400, function() {
            $(this).remove();
            updateStats();
        });
    }
});

// 編集ボタンクリック時の処理
$(document).on('click', '.edit-btn', function() {
    const todoText = $(this).closest('.todo-item').find('.todo-text');
    const currentText = todoText.text();
    
    // インライン編集
    const input = $(`<input type="text" class="edit-input" value="${currentText}" style="
        border: 2px solid #667eea;
        border-radius: 8px;
        padding: 8px 12px;
        font-size: 16px;
        font-family: 'Poppins', sans-serif;
        outline: none;
        background: white;
        flex-grow: 1;
    ">`);
    
    todoText.replaceWith(input);
    input.focus().select();
    
    // 編集完了処理
    function finishEdit() {
        const newText = input.val().trim();
        if (newText !== "") {
            const newSpan = $(`<span class="todo-text">${newText}</span>`);
            if (input.closest('.todo-item').find('.todo-checkbox').is(':checked')) {
                newSpan.addClass('completed');
            }
            input.replaceWith(newSpan);
        } else {
            const originalSpan = $(`<span class="todo-text">${currentText}</span>`);
            if (input.closest('.todo-item').find('.todo-checkbox').is(':checked')) {
                originalSpan.addClass('completed');
            }
            input.replaceWith(originalSpan);
        }
    }
    
    // Enterキーまたはフォーカス外れで編集完了
    input.keypress(function(e) {
        if (e.which === 13) {
            finishEdit();
        }
    }).blur(finishEdit);
});

// ダブルクリックで編集
$(document).on('dblclick', '.todo-text', function() {
    $(this).siblings('.todo-actions').find('.edit-btn').click();
});

// 初期化
$(document).ready(function() {
    updateStats();
    
    // ウェルカムアニメーション
    $(".container").css('opacity', '0').animate({
        opacity: 1
    }, 1000);
    
    // 入力フィールドにフォーカス
    $("#input").focus();
});

// キーボードショートカット
$(document).keydown(function(e) {
    // Ctrl + Enter で最初の未完了タスクを完了
    if (e.ctrlKey && e.which === 13) {
        const firstPendingTask = $("#todoList .todo-checkbox:not(:checked)").first();
        if (firstPendingTask.length) {
            firstPendingTask.click();
        }
    }
    
    // Ctrl + D で最初の完了済みタスクを削除
    if (e.ctrlKey && e.which === 68) {
        e.preventDefault();
        const firstCompletedTask = $("#todoList .todo-checkbox:checked").first();
        if (firstCompletedTask.length) {
            firstCompletedTask.closest('.todo-item').find('.delete-btn').click();
        }
    }
});

// CSVエクスポート機能
$("#exportCSV").click(function() {
    exportToCSV();
});

function exportToCSV() {
    const tasks = [];
    const currentDate = new Date().toISOString().split('T')[0];
    
    // ヘッダー行を追加
    tasks.push(['タスク名', 'ステータス', '作成日時']);
    
    // 各タスクの情報を収集
    $("#todoList .todo-item").each(function() {
        const taskText = $(this).find('.todo-text').text();
        const isCompleted = $(this).find('.todo-checkbox').is(':checked');
        const status = isCompleted ? '完了' : '未完了';
        const createdDate = currentDate; // 実際のアプリでは作成日時を保存する必要があります
        
        tasks.push([taskText, status, createdDate]);
    });
    
    if (tasks.length <= 1) {
        alert('エクスポートするタスクがありません。');
        return;
    }
    
    // CSVデータを作成
    const csvContent = tasks.map(row => 
        row.map(field => `"${field.toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    // BOMを追加してExcelで正しく表示されるようにする
    const bom = '\uFEFF';
    const csvData = bom + csvContent;
    
    // ダウンロード用のBlobを作成
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `todo-list-${currentDate}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 成功メッセージを表示
        showNotification('CSVファイルがダウンロードされました！', 'success');
    }
}

// CSVインポート機能
$("#importCSV").click(function() {
    $("#csvFileInput").click();
});

$("#csvFileInput").change(function(e) {
    const file = e.target.files[0];
    if (file) {
        importFromCSV(file);
    }
});

function importFromCSV(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csv = e.target.result;
            const lines = csv.split('\n');
            let importedCount = 0;
            
            // ヘッダー行をスキップ
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line) {
                    // CSVの行を解析（簡易版）
                    const columns = parseCSVLine(line);
                    if (columns.length >= 2) {
                        const taskText = columns[0].replace(/^"|"$/g, '').replace(/""/g, '"');
                        const status = columns[1].replace(/^"|"$/g, '');
                        
                        if (taskText) {
                            // タスクを追加
                            taskCounter++;
                            const taskId = `task-${taskCounter}`;
                            const isCompleted = status === '完了';
                            
                            const taskHtml = `
                                <li class="todo-item ${isCompleted ? 'completed' : ''}" data-task-id="${taskId}">
                                    <div class="priority-indicator"></div>
                                    <input type="checkbox" class="todo-checkbox" id="${taskId}" ${isCompleted ? 'checked' : ''}>
                                    <span class="todo-text ${isCompleted ? 'completed' : ''}">${taskText}</span>
                                    <div class="todo-actions">
                                        <button class="action-btn edit-btn" title="編集">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="action-btn delete-btn" title="削除">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </li>
                            `;
                            
                            $("#todoList").append(taskHtml);
                            importedCount++;
                        }
                    }
                }
            }
            
            updateStats();
            showNotification(`${importedCount}個のタスクをインポートしました！`, 'success');
            
        } catch (error) {
            showNotification('CSVファイルの読み込みに失敗しました。', 'error');
            console.error('CSV import error:', error);
        }
    };
    
    reader.readAsText(file, 'UTF-8');
    // ファイル入力をリセット
    $("#csvFileInput").val('');
}

// 簡易CSV行解析関数
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++; // 次の引用符をスキップ
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current);
    return result;
}

// 通知表示機能
function showNotification(message, type = 'info') {
    const notification = $(`
        <div class="notification ${type}" style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'linear-gradient(135deg, #4ecdc4, #44a08d)' : 'linear-gradient(135deg, #ff6b6b, #ee5a52)'};
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            font-family: 'Poppins', sans-serif;
            font-weight: 500;
            animation: slideInRight 0.3s ease-out;
        ">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            ${message}
        </div>
    `);
    
    $('body').append(notification);
    
    // 3秒後に自動削除
    setTimeout(() => {
        notification.animate({
            opacity: 0,
            transform: 'translateX(100%)'
        }, 300, function() {
            $(this).remove();
        });
    }, 3000);
}