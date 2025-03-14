import asyncio
from def_simulation import run_simulation_with_params, get_conversation

async def test_simulation():
    # Test the run_simulation_with_params function with custom parameters
    result = await run_simulation_with_params(
        bot_id=16,
        user_prompt="xin chào",
        max_turns=3,
        history=None
    )
    
    # Print results
    print(result)
    
async def test_get_conversation():
    # Test the get_conversation function with custom parameters
    conversation = await get_conversation(
        bot_id=16,
        user_prompt="xin chào",
        max_turns=3,
        history=None
    )
    
    # Print conversation
    print("\n===== Conversation from get_conversation =====")
    for i, msg in enumerate(conversation):
        print(f"{i+1}. {msg['role']}: {msg['content'][:100]}...")

if __name__ == "__main__":
    # Run the test functions
    asyncio.run(test_get_conversation())  # Test the new function 