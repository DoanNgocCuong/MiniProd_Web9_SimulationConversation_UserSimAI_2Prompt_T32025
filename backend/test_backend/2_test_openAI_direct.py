import os
import json
import time
import sys
import asyncio
from openai import AsyncOpenAI
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get OpenAI API key from environment variable
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    print("Error: OPENAI_API_KEY environment variable not set")
    sys.exit(1)

# Initialize OpenAI client
client = AsyncOpenAI(api_key=api_key)

async def test_openai_completion(prompt, model="gpt-4o-mini"):
    """Test OpenAI completion API."""
    print(f"\n===== Testing OpenAI Completion =====")
    print(f"Model: {model}")
    print(f"Prompt: {prompt}")
    
    try:
        start_time = time.time()
        response = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=100,
            temperature=0.7
        )
        elapsed_time = time.time() - start_time
        
        print(f"Response received in {elapsed_time:.2f} seconds")
        print(f"Response: {response.choices[0].message.content}")
        
        return {
            "success": True,
            "elapsed_time": elapsed_time,
            "response": response.choices[0].message.content,
            "model": model,
            "prompt_tokens": response.usage.prompt_tokens,
            "completion_tokens": response.usage.completion_tokens,
            "total_tokens": response.usage.total_tokens
        }
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

async def test_openai_conversation(conversation, model="gpt-4o-mini"):
    """Test OpenAI with a conversation."""
    print(f"\n===== Testing OpenAI Conversation =====")
    print(f"Model: {model}")
    print(f"Conversation length: {len(conversation)} messages")
    
    try:
        start_time = time.time()
        response = await client.chat.completions.create(
            model=model,
            messages=conversation,
            max_tokens=100,
            temperature=0.7
        )
        elapsed_time = time.time() - start_time
        
        print(f"Response received in {elapsed_time:.2f} seconds")
        print(f"Response: {response.choices[0].message.content}")
        
        return {
            "success": True,
            "elapsed_time": elapsed_time,
            "response": response.choices[0].message.content,
            "model": model,
            "prompt_tokens": response.usage.prompt_tokens,
            "completion_tokens": response.usage.completion_tokens,
            "total_tokens": response.usage.total_tokens
        }
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

async def main():
    """Main function to run the tests."""
    results = []
    
    # Test 1: Simple completion
    prompt = "Explain the difference between Python and JavaScript in 3 sentences."
    result = await test_openai_completion(prompt)
    results.append({"test": "Simple completion", "result": result})
    
    # Test 2: Vietnamese prompt
    prompt_vi = "Giải thích sự khác biệt giữa Python và JavaScript trong 3 câu."
    result = await test_openai_completion(prompt_vi)
    results.append({"test": "Vietnamese prompt", "result": result})
    
    # Test 3: Conversation
    conversation = [
        {"role": "system", "content": "You are a helpful assistant for learning English."},
        {"role": "user", "content": "Xin chào, tôi muốn học tiếng Anh."},
        {"role": "assistant", "content": "Chào bạn! Rất vui được giúp bạn học tiếng Anh. Bạn muốn bắt đầu với chủ đề nào?"},
        {"role": "user", "content": "Tôi muốn học về chủ đề gia đình."}
    ]
    result = await test_openai_conversation(conversation)
    results.append({"test": "Conversation", "result": result})
    
    # Test 4: Different model (if available)
    try:
        result = await test_openai_completion(prompt, model="gpt-4o")
        results.append({"test": "GPT-4o model", "result": result})
    except Exception as e:
        print(f"GPT-4o test skipped: {str(e)}")
    
    # Print summary
    print("\n===== Test Results Summary =====")
    for test in results:
        status = "SUCCESS" if test["result"]["success"] else "FAILED"
        print(f"{test['test']}: {status}")
        if test["result"]["success"]:
            print(f"  Time: {test['result']['elapsed_time']:.2f}s, Tokens: {test['result'].get('total_tokens', 'N/A')}")
        else:
            print(f"  Error: {test['result']['error']}")

if __name__ == "__main__":
    print("Testing OpenAI direct integration...")
    asyncio.run(main())
